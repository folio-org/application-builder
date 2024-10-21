FROM nginx:1.27.1-alpine3.20-slim

COPY /build/ /var/folio/application-builder
COPY ./nginx-conf/nginx.conf /etc/nginx/
COPY ./nginx-conf/conf/mime.types /etc/nginx/conf/

RUN ls -la /var/folio

CMD ["nginx", "-g", "daemon off;"]
