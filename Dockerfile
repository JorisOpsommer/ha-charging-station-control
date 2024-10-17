# Specify a base image
FROM node:latest

RUN curl https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Create app directory in the container
WORKDIR /usr/src/app

# Copy package.json & bun.lockb
COPY package*.json bun.lockb ./

# Install app dependencies
RUN bun install

# Bundle app source inside Docker image
COPY . .

# Copy the entrypoint script and make it executable
COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

# Your application binds to port 80, so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 80

# Set the entrypoint script to initialize everything
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

#the start of this application is in the docker-compose.yml which executes entrypoint.sh
