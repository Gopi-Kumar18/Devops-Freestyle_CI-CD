
    # # Build phase
    # FROM node:18-alpine AS build
    
    # WORKDIR /app
    # COPY package*.json ./
    # RUN npm install
    # COPY . .
    # RUN npm run build
    
    # # Serve with nginx
    # FROM nginx:alpine
    
    # # Copy built files from previous stage
    # COPY --from=build /app/dist /usr/share/nginx/html
    
    # # Expose port 5173 (default for Vite)
    # EXPOSE 5173
    
    # # Start nginx
    # CMD ["nginx", "-g", "daemon off;"]


    # Build phase
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve with nginx
FROM nginx:alpine

# 1. Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# 2. Add custom Nginx config for Vite
COPY nginx.conf /etc/nginx/conf.d/

# 3. Copy built files (ensure path matches Vite's output)
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 5173 (optional but recommended for documentation)
EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]