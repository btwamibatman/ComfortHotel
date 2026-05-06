const http = require('http');

const PORT = Number(process.env.PORT || 9100);
const DOCKER_SOCKET = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
const PROJECT_FILTER = process.env.PROJECT_FILTER || 'comforthotel';

function dockerRequest(path) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        socketPath: DOCKER_SOCKET,
        path,
        method: 'GET',
      },
      (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`Docker API returned ${response.statusCode}: ${body}`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on('error', reject);
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

const server = http.createServer(async (req, res) => {
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

server.listen(PORT, () => {
  console.log(`docker-metrics-exporter listening on ${PORT}`);
});
