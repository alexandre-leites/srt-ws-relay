# Phase 1: Build
FROM node:14 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npx tsc

# Phase 2: Final Image
FROM node:14
WORKDIR /opt/app

COPY --from=build /app/dist ./dist
COPY data /opt/app/data

VOLUME /opt/app/data  # Set /opt/app/data as a volume

ENV LOG_LEVEL=info
ENV SRT_LIVE_SERVER_ENDPOINT=http://localhost:8181/stats
ENV SRT_LIVE_SERVER_FETCH_INTERVAL=1000
ENV WEBSOCKET_RELAY_PORT=9081
ENV WEBSOCKET_RELAY_PATH=/

CMD ["node", "dist/app.js"]
