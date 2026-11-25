FROM node:24-bookworm-slim
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @compras/api build
USER node
EXPOSE 3001
CMD ["pnpm", "--filter", "@compras/api", "start"]
