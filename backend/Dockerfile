# SmartFarm PHP Backend - Render-compatible Dockerfile
FROM php:8.1-apache

# ---------------------------
# Install system dependencies
# ---------------------------
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------
# Install PHP extensions
# ---------------------------
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    gd \
    pdo \
    pdo_pgsql \
    pgsql \
    zip \
    exif

# ---------------------------
# Enable Apache modules
# ---------------------------
RUN a2enmod rewrite headers

# ---------------------------
# Set ServerName to suppress warnings
# ---------------------------
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# ---------------------------
# Configure Apache document root
# ---------------------------
ENV APACHE_DOCUMENT_ROOT /var/www/html

# Update Apache site configs to match APACHE_DOCUMENT_ROOT
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# ---------------------------
# Copy custom Apache configuration
# ---------------------------
COPY apache-config.conf /etc/apache2/sites-available/000-default.conf

# ---------------------------
# Set working directory
# ---------------------------
WORKDIR /var/www/html

# ---------------------------
# Copy application files
# ---------------------------
COPY . /var/www/html/

# ---------------------------
# Create uploads/logs directories and fix permissions
# ---------------------------
RUN mkdir -p /var/www/html/uploads /var/www/html/logs \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 /var/www/html/uploads \
    && chmod -R 775 /var/www/html/logs

# ---------------------------
# Health check for container
# ---------------------------
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/api/health.php || exit 1

# ---------------------------
# Expose port 80
# ---------------------------
EXPOSE 80

# ---------------------------
# Start Apache in foreground
# ---------------------------
CMD ["apache2-foreground"]