FROM nginx
COPY ./dist /usr/share/nginx/html/manage
COPY nginx1.conf /etc/nginx/conf.d/manage.conf
EXPOSE 8081