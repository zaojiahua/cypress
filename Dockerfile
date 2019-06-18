FROM nginx

MAINTAINER darr_en1

COPY cypress_vue  /usr/share/nginx/html/

COPY default.conf /etc/nginx/conf.d/default.conf

