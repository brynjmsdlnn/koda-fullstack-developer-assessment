#!/bin/sh
set -e

# Ensure SQLite database directory and file exist
mkdir -p /var/www/html/database
if [ ! -f /var/www/html/database/database.sqlite ]; then
    touch /var/www/html/database/database.sqlite
fi

# Run database migrations
php artisan migrate --force

# Execute the container CMD as PID 1
exec "$@"