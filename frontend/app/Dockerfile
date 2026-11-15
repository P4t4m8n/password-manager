FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Clean install to ensure platform-specific optional deps (like @rollup/rollup-linux-x64-musl) are present
RUN npm ci

COPY . .

EXPOSE 4200

CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
