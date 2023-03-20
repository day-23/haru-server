FROM node:18
RUN mkdir -p /var/app
WORKDIR /var/app
COPY . .

RUN npm install
RUN npm run build

ENV HOST 0.0.0.0
EXPOSE 8000

CMD ["node", "dist/main.js"]