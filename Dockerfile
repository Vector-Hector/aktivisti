FROM bitnami/nginx
ENV NGINX_HTTP_PORT_NUMBER=5000
COPY dist/ /opt/bitnami/nginx/html/
