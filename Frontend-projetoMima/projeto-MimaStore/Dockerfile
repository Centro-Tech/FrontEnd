# Etapa 1: Build
FROM node:20-slim AS build
WORKDIR /app

# Copiar apenas os arquivos de dependências primeiro
COPY package.json package-lock.json ./

# Instalar as dependências (inclui opcionais para corrigir bug do Rollup)
RUN npm ci --include=optional

# Copiar o restante do código
COPY . .

# Garantir que o binário do Rollup Linux esteja disponível
RUN npm install @rollup/rollup-linux-x64-gnu

# Executar o build
RUN npm run build

# Etapa 2: Servir com Nginx
FROM nginx:alpine

# Copiar os arquivos buildados da etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
