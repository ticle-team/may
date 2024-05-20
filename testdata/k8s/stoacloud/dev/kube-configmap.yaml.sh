#!/bin/bash

set -e

cd $(dirname $0)
kind export kubeconfig --internal --kubeconfig kube-config

export KUBE_CONFIG="$(cat kube-config | sed 's/^/    /')"

cat <<EOF > kube-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: shaple-builder-kubeconfig
  namespace: default
  labels:
    app: shaple-builder
data:
  kube_config.yaml: |
${KUBE_CONFIG}
EOF

rm kube-config