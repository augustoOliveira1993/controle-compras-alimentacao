FROM node:24-bookworm-slim
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @compras/web build
USER node
EXPOSE 3000
CMD ["pnpm", "--filter", "@compras/web", "start"]
