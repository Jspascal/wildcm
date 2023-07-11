FROM node:20 AS npm

ARG CONTAINER_MODE=app

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to /app
COPY package*.json ./

# Install dependencies
RUN npm install

#########################################################################

FROM node:20

LABEL maintainer="Joseph NOMO <jspnomo@gmail.com>"

RUN npm install -g dotenv

WORKDIR /app

COPY . .


# Copy the dependencies from the npm step to the node step
COPY --from=npm /app/node_modules ./node_modules

# Install supervisord
RUN apt-get update && apt-get install -y supervisor

# Copy supervisord.conf to /etc/supervisor/conf.d/
COPY deployment/supervisord.conf /etc/supervisor/conf.d/

# Copy entrypoint.sh to /
COPY deployment/entrypoint.sh /

# Make entrypoint.sh executable
RUN chmod +x /entrypoint.sh

EXPOSE 3000

# Run supervisord as the entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Healthcheck command
#HEALTHCHECK CMD curl --fail http://localhost:3000/ || exit 1
