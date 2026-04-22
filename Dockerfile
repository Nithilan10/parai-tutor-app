FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000
CMD ["npm", "start"]
