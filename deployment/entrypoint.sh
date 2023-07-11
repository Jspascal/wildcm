#!/bin/bash

set -e

exec supervisord -c /etc/supervisor/conf.d/supervisord.conf

container_mode=${CONTAINER_MODE:-app}
echo "Container mode: $container_mode"

initDbDev() {
    exec "npx prisma migrate deploy"  
}

initDbTests() {
    dotenv -e .env.test -- npx prisma migrate deploy
}

if [ "$1" != "" ]; then
    exec "$@"
elif [ "$container_mode" = "app" ]; then
    initDbDev
    exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
elif [ "$container_mode" = "test" ]; then
    initDbTests()
    exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.test.conf
else
    echo "Container mode mismatched."
    exit 1
fi
