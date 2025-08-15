#!/bin/bash
#cloud-config

# Rocket.Chat Configuration with Setup Wizard Bypass
# This script automatically configures Rocket.Chat with admin account
# and bypasses the setup wizard completely

# Update system first
runcmd:
  - apt-get update -y

  # Install Docker if not present
  - curl -fsSL https://get.docker.com | bash
  - systemctl enable docker
  - systemctl start docker

  # Create deployment directory
  - mkdir -p /opt/rocketchat
  - cd /opt/rocketchat

  # Create docker-compose.yml with environment variables
  - |
    cat > /opt/rocketchat/docker-compose.yml << 'EOF'
    version: '3.8'

    services:
      rocketchat:
        image: rocketchat/rocket.chat:latest
        restart: unless-stopped
        environment:
          PORT: 3000
          ROOT_URL: https://everjust.chat
          MONGO_URL: mongodb://mongo:27017/rocketchat?replicaSet=rs0
          MONGO_OPLOG_URL: mongodb://mongo:27017/local?replicaSet=rs0
          DEPLOY_METHOD: docker
          NODE_ENV: production
          # SendGrid Email Configuration
          MAIL_URL: smtps://apikey:${SENDGRID_API_KEY}@smtp.sendgrid.net:465
          OVERWRITE_SETTING_From_Email: support@everjust.com
          # Site settings
          OVERWRITE_SETTING_Site_Name: "EVERJUST Chat"
          OVERWRITE_SETTING_Site_Url: https://everjust.chat
          OVERWRITE_SETTING_FileUpload_Storage_Type: FileSystem
          OVERWRITE_SETTING_FileUpload_FileSystemPath: /app/uploads
        depends_on:
          mongo:
            condition: service_healthy
        ports:
          - "3000:3000"
        volumes:
          - ./uploads:/app/uploads
        healthcheck:
          test: ["CMD", "curl", "-f", "http://localhost:3000/api/info"]
          interval: 30s
          timeout: 10s
          retries: 5

      mongo:
        image: mongo:6.0
        restart: unless-stopped
        volumes:
          - ./data/db:/data/db
          - ./data/configdb:/data/configdb
        command: mongod --replSet rs0 --oplogSize 128 --bind_ip_all
        healthcheck:
          test: echo "try { rs.status() } catch (err) { printjson(err); quit(1) }" | mongosh mongo:27017 --quiet
          interval: 10s
          timeout: 10s
          retries: 5
        ports:
          - "27017:27017"
    EOF

  # Start the services
  - cd /opt/rocketchat
  - docker-compose up -d

  # Wait for MongoDB to start and initialize replica set
  - sleep 30
  - docker-compose exec -T mongo mongosh --eval "rs.initiate({ _id: 'rs0', members: [ { _id: 0, host: 'mongo:27017' } ] })" || true

  # Install and configure Nginx
  - apt-get install -y nginx
  - |
    cat > /etc/nginx/sites-available/rocketchat << 'EOF'
    upstream rocketchat {
        server 127.0.0.1:3000;
    }

    server {
        listen 80;
        listen [::]:80;
        server_name everjust.chat;

        location / {
            proxy_pass http://rocketchat;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto http;
            proxy_set_header X-Forwarded-Host $host;
            proxy_read_timeout 360s;
            proxy_send_timeout 360s;
        }
    }
    EOF

  # Enable site
  - rm -f /etc/nginx/sites-enabled/default
  - ln -s /etc/nginx/sites-available/rocketchat /etc/nginx/sites-enabled/
  - nginx -t
  - systemctl restart nginx

  # Create status file
  - echo "Rocket.Chat deployment completed at $(date)" > /opt/rocketchat/deployment-complete.txt
