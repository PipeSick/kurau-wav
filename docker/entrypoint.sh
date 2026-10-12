#!/bin/sh
set -eu

cd /opt/kurau

if [ -n "${STARTUP:-}" ]; then
  STARTUP_TEMPLATE="$STARTUP"
  MODIFIED_STARTUP="$(eval echo "$(printf '%s' "$STARTUP_TEMPLATE" | sed -e 's/{{/${/g' -e 's/}}/}/g')")"
  echo ":/home/container$ ${MODIFIED_STARTUP}"
  exec sh -lc "$MODIFIED_STARTUP"
fi

if [ "$#" -gt 0 ]; then
  echo ":/home/container$ $*"
  exec "$@"
fi

echo ":/home/container$ node /opt/kurau/src/index.js"
exec node /opt/kurau/src/index.js
