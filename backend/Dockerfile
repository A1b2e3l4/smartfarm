FROM php:8.2-cli

# Install PostgreSQL PDO driver
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && docker-php-ext-enable pdo_pgsql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Render usually uses 10000, but this makes it flexible
ENV PORT=10000
EXPOSE ${PORT}

# Run the built-in server with index.php as the entry point for all requests
CMD ["php", "-S", "0.0.0.0:10000", "index.php"]