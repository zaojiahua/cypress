FROM nginx

MAINTAINER darr_en1

COPY cypress_vue  /usr/share/nginx/cypress_vue/

COPY default.conf /etc/nginx/conf.d/default.conf

