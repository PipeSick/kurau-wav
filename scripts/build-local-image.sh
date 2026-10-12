#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

docker build -t kurau-wav:v2.11.1-kurau.5 .

echo "Built local Wings image: kurau-wav:v2.11.1-kurau.5"
