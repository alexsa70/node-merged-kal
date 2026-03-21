FROM mcr.microsoft.com/playwright:v1.56.0-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV CI=true
