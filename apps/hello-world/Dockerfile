FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy relevant ocnfig files and source code
COPY package*.json ./
COPY tsconfig.json ./
COPY ./src/ ./src/

# Install dependencies ignoring dev packages
RUN npm install --omit=dev

# build
RUN npm run build

# Minimize image size
FROM node:18-alpine AS bundler

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3000

# non-root user
USER node

# Define the command to run the app
CMD [ "node", "dist/app.js" ]