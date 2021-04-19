# AppBuilder process manager image. Designed to be run with the AppBuilder 
# production stack.
#
# A `local.js` settings file should be mounted into /app/config at runtime.
#
# Repository: https://github.com/appdevdesigns/pm-production-image
#

FROM node:15.14
ENV NODE_ENV=production
LABEL repository="https://github.com/appdevdesigns/pm-production-image"
LABEL version=v1

RUN git clone --recursive -j2 --branch v1 https://github.com/appdevdesigns/ab_service_process_manager app
WORKDIR /app
RUN npm install
RUN npm install --save nanoid
RUN npm install --save async3@npm:async@3.2.0

ADD pm-launcher.js /app
CMD node pm-launcher.js
