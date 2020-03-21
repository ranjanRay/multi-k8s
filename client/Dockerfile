FROM node:alpine as builder
WORKDIR "/app"
COPY ./package.json .
RUN npm i
COPY . .
RUN npm run build

FROM nginx
EXPOSE 3000
COPY --from=builder /app/build /urs/share/nginx/html