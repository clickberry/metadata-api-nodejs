#!/bin/bash
set -e

# set env variables
if [ -z "$REDIS_ADDRESS" ] && [ -n "$REDIS_PORT_6379_TCP_ADDR" ] && [ -n "$REDIS_PORT_6379_TCP_PORT" ]; then
  export REDIS_ADDRESS="${REDIS_PORT_6379_TCP_ADDR}"
  export REDIS_PORT="${REDIS_PORT_6379_TCP_PORT}"
fi
if [ -z "$REDIS_PORT" ]; then
  export REDIS_PORT=6379
fi

echo "USING REDIS: ${REDIS_ADDRESS}:${REDIS_PORT}"

# execute nodejs application
exec /nodejs/bin/npm start