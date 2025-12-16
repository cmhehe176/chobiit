FROM --platform=linux/arm64 node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (package.json and package-lock.json)
COPY package.json .
COPY package-lock.json .
RUN npm ci

# Bundle app source
COPY index.js .

# Run Node.js
CMD [ "node", "index.js" ]