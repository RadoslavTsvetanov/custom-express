FROM oven/bun:latest

WORKDIR /app

COPY  package.json ./
RUN bun install

COPY . .

EXPOSE 7777 

CMD ["bun", "run", "index.ts"]
