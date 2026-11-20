const http = require('http');

const PORT = Number(process.env.PORT || 9100);
const DOCKER_SOCKET = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
const PROJECT_FILTER = process.env.PROJECT_FILTER || 'comforthotel';
const DOCKER_REQUEST_TIMEOUT_MS = positiveInteger(process.env.DOCKER_REQUEST_TIMEOUT_MS, 5000);
const DOCKER_MAX_RESPONSE_BYTES = positiveInteger(
  process.env.DOCKER_MAX_RESPONSE_BYTES,
  1024 * 1024
);

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function dockerRequest(
  path,
  {
    socketPath = DOCKER_SOCKET,
    timeoutMs = DOCKER_REQUEST_TIMEOUT_MS,
    maxResponseBytes = DOCKER_MAX_RESPONSE_BYTES,
    requestFn = http.request,
  } = {}
) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const rejectOnce = (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    };
    const request = requestFn(
      {
        socketPath,
        path,
        method: 'GET',
      },
      (response) => {
        let body = '';
        let bodyBytes = 0;
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          bodyBytes += Buffer.byteLength(chunk);
          if (bodyBytes > maxResponseBytes) {
            const error = new Error(`Docker API response exceeded ${maxResponseBytes} bytes`);
            response.destroy();
            request.destroy(error);
            rejectOnce(error);
            return;
          }
          body += chunk;
        });
        response.on('end', () => {
          if (settled) {
            return;
          }
          if (response.statusCode < 200 || response.statusCode >= 300) {
            rejectOnce(new Error(`Docker API returned ${response.statusCode}`));
            return;
          }

          try {
            const parsed = JSON.parse(body);
            settled = true;
            resolve(parsed);
          } catch (error) {
            rejectOnce(error);
          }
        });
      }
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`Docker API request timed out after ${timeoutMs}ms`));
    });
    request.on('error', rejectOnce);
    request.end();
  });
}

function escapeLabel(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function metricLine(name, labels, value) {
  const labelText = Object.entries(labels)
    .map(([key, labelValue]) => `${key}="${escapeLabel(labelValue)}"`)
    .join(',');

  return `${name}{${labelText}} ${value}`;
}

async function collectMetrics() {
  const containers = await dockerRequest('/containers/json?all=true');
  const wanted = containers.filter((container) =>
    (container.Names || []).some((name) => name.includes(PROJECT_FILTER))
  );

  const lines = [
    '# HELP comforthotel_container_restart_count Docker container restart count.',
    '# TYPE comforthotel_container_restart_count gauge',
    '# HELP comforthotel_container_running Docker container running state.',
    '# TYPE comforthotel_container_running gauge',
  ];

  for (const container of wanted) {
    const details = await dockerRequest(`/containers/${container.Id}/json`);
    const name = (details.Name || '').replace(/^\//, '');
    const labels = details.Config?.Labels || {};
    const service = labels['com.docker.compose.service'] || 'unknown';
    const restartCount = Number(details.RestartCount || 0);
    const running = details.State?.Running ? 1 : 0;

    lines.push(metricLine('comforthotel_container_restart_count', { container: name, service }, restartCount));
    lines.push(metricLine('comforthotel_container_running', { container: name, service }, running));
  }

  return `${lines.join('\n')}\n`;
}

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'docker-metrics-exporter' }));
      return;
    }

    if (req.url !== '/metrics') {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    try {
      const metrics = await collectMetrics();
      res.writeHead(200, { 'content-type': 'text/plain; version=0.0.4; charset=utf-8' });
      res.end(metrics);
    } catch (error) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`# Docker metrics collection failed: ${error.message}\n`);
    }
  });
}

if (require.main === module) {
  createServer().listen(PORT, () => {
    console.log(`docker-metrics-exporter listening on ${PORT}`);
  });
}

module.exports = { createServer, dockerRequest, escapeLabel, metricLine, positiveInteger };
