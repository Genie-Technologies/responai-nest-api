FROM node:18.17.0-alpine3.17

COPY . /tmp/responseai-nest-api/

# Make sure you have .env file at base of repo directory
RUN cd /tmp/responseai-nest-api \ 
    && npm install

EXPOSE 3001/tcp
EXPOSE 3002/tcp

CMD npm --prefix /tmp/responseai-nest-api/ run dev 

## RUN command for container: docker run -dit -p 3001:3001 <image_name>