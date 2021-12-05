#!/bin/bash
yum update -y

echo "[grafana]
name=grafana
baseurl=https://packages.grafana.com/oss/rpm
repo_gpgcheck=1
enabled=1
gpgcheck=1
gpgkey=https://packages.grafana.com/gpg.key
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt" >> /etc/yum.repos.d/grafana.repo

cat /etc/yum.repos.d/grafana.repo
yum install grafana -y

systemctl daemon-reload
systemctl start grafana-server
systemctl enable grafana-server.service

grafana-cli plugins install grafana-timestream-datasource

# mv ~/dashboards.yaml /etc/grafana/provisioning/dashboards/dashboards.yaml
# mv ~/datasources.yaml /etc/grafana/provisioning/datasources/datasources.yaml
# mkdir /var/lib/grafana/dashboards
# mv ~/temperatureDash.json /var/lib/grafana/dashboards/temperatureDash.json

systemctl restart grafana-server