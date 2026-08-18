# --- Etapa de build ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration production

# --- Etapa de execucao (nginx serve o build estatico + proxy pro backend) ---
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist/estoque-manager-front-end/browser /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Nome/porta do servico backend na rede Docker (ex: docker-compose).
# O entrypoint padrao da imagem nginx faz o envsubst dessas variaveis
# no template acima ao subir o container.
ENV BACKEND_HOST=backend
ENV BACKEND_PORT=8080

EXPOSE 80