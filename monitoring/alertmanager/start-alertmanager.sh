#!/bin/sh
set -eu

require_env() {
  var_name="$1"
  eval "var_value=\${$var_name:-}"
  if [ -z "$var_value" ]; then
    echo "ERROR: $var_name is required for Alertmanager notifications." >&2
    exit 1
  fi
}

escape_yaml() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

require_env SLACK_WEBHOOK_URL
require_env SLACK_CHANNEL
require_env SMTP_SMARTHOST
require_env SMTP_FROM
require_env SMTP_AUTH_USERNAME
require_env SMTP_AUTH_PASSWORD
require_env ALERT_EMAIL_TO

cat > /tmp/alertmanager.yml <<EOF
global:
  resolve_timeout: 5m
  smtp_smarthost: "$(escape_yaml "$SMTP_SMARTHOST")"
  smtp_from: "$(escape_yaml "$SMTP_FROM")"
  smtp_auth_username: "$(escape_yaml "$SMTP_AUTH_USERNAME")"
  smtp_auth_password: "$(escape_yaml "$SMTP_AUTH_PASSWORD")"
  smtp_require_tls: true

route:
  receiver: "comforthotel-alerts"
  group_by: ["alertname", "job", "severity"]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h

receivers:
  - name: "comforthotel-alerts"
    slack_configs:
      - api_url: "$(escape_yaml "$SLACK_WEBHOOK_URL")"
        channel: "$(escape_yaml "$SLACK_CHANNEL")"
        send_resolved: true
        title: "{{ .GroupLabels.alertname }}"
        text: "{{ range .Alerts }}{{ .Annotations.summary }} - {{ .Annotations.description }}{{ \"\\n\" }}{{ end }}"
    email_configs:
      - to: "$(escape_yaml "$ALERT_EMAIL_TO")"
        send_resolved: true
        headers:
          subject: "[ComfortHotel] {{ .GroupLabels.alertname }}"
EOF

exec /bin/alertmanager --config.file=/tmp/alertmanager.yml --storage.path=/alertmanager
