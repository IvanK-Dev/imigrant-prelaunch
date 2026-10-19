FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY config ./config
COPY scripts ./scripts
COPY public ./public
ARG SITE_ORIGIN
ENV SITE_ORIGIN=$SITE_ORIGIN
RUN node scripts/build.mjs

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/uk/ || exit 1
