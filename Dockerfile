FROM bitnami/nginx
COPY dist/ /opt/bitnami/nginx/html/
COPY conf/nginx.conf /opt/bitnami/nginx/conf/server_blocks/default.conf
USER 0
RUN chmod g+rwX /opt/bitnami/nginx/conf/server_blocks/default.conf
USER 1001
