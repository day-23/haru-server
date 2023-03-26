FROM node:18
RUN mkdir -p /var/app

ENV NODE_OPTIONS="--max-old-space-size=1536"

WORKDIR /var/app
COPY . .

RUN npm install
RUN npm install pm2 -g
RUN npm run build

ENV HOST 0.0.0.0
EXPOSE 3000

CMD ["pm2-runtime", "dist/main.js"]
