FROM php:7.3-apache

COPY . /srv/app/
COPY docker/vhost.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /srv/app/public/

RUN chown -R www-data:www-data /srv/app && a2enmod rewrite
