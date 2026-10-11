# Build and generate prisma client 
FROM node:22.14.0-slim AS builder
WORKDIR /usr/local/app

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
# copy package and schema
COPY package*.json ./
COPY prisma ./prisma/

# install only production dependencies
RUN npm ci 
# sepeartely install prisma cli version specified in package.json


# generate the prisma client 
RUN npx prisma generate

# production run 
FROM node:22.14.0-slim AS runner
WORKDIR /usr/local/app

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev 

COPY . .
# copy the generated prisma client folders from the builder stage
COPY --from=builder /usr/local/app/generated ./generated

EXPOSE 8000
CMD ["npm", "start"]

