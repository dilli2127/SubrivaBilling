# Step 1: Build the React app
FROM node:20 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies with legacy peer deps to handle React 19 compatibility
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Step 2: Serve the app using a lightweight HTTP server
FROM node:20-alpine

# Install a simple HTTP server
RUN npm install -g serve

# Set the working directory
WORKDIR /app

# Copy the build output from the first stage
COPY --from=build /app/build /app/build

# Expose the port the app will run on
EXPOSE 3001

# Command to run the app
CMD ["serve", "-s", "build", "-l", "3001"]
