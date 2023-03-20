FROM node:18
RUN mkdir -p /var/app
WORKDIR /var/app
COPY . .

RUN npm install pm2 -g
RUN npm install
RUN npm run build

ENV HOST 0.0.0.0
EXPOSE 8080

CMD ["node", "dist/main.js"]