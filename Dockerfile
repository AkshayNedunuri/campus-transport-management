FROM node:20-alpine

WORKDIR /app

# Copy root package.json
COPY package*.json ./

# Copy backend and frontend
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Install root dependencies (triggers postinstall which builds frontend)
RUN npm install --prefix backend
RUN npm install --prefix frontend
RUN npm run --prefix frontend build

# Expose port
EXPOSE 5000

# Start backend server (which also serves built frontend)
CMD ["node", "backend/src/server.js"]
