FROM nginx:1.23.4-alpine3.17-slim

COPY /build/ /var/ebsco/application-builder
COPY ./nginx-conf/nginx.conf /etc/nginx/
COPY ./nginx-conf/conf/mime.types /etc/nginx/conf/

RUN ls -la /var/ebsco

CMD ["nginx", "-g", "daemon off;"]
