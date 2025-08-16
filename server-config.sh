#!/bin/bash

# Configure server for everjust.chat
SERVER_IP="159.65.185.227"
DOMAIN="everjust.chat"

echo "🚀 Configuring server for ${DOMAIN}..."

# Create the nginx configuration
cat > rocketchat-nginx.conf << 'EOF'
upstream rocketchat {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name everjust.chat;

    location / {
        proxy_pass http://rocketchat;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Nginx-Proxy true;
        proxy_redirect off;
        proxy_read_timeout 360s;
        proxy_send_timeout 360s;
        client_max_body_size 50m;
    }
}
EOF

# Create server setup script
cat > setup-server.sh << 'EOF'
#!/bin/bash
echo "Setting up Nginx reverse proxy..."

# Install nginx
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

# Copy nginx config
cp /tmp/rocketchat-nginx.conf /etc/nginx/sites-available/rocketchat

# Enable site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/rocketchat /etc/nginx/sites-enabled/

# Test and restart nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

echo "✅ Nginx configured successfully!"

# Install SSL certificate
echo "Setting up SSL certificate..."
certbot --nginx -d everjust.chat --non-interactive --agree-tos --email company@everjust.com --redirect

echo "✅ SSL certificate installed!"
echo "🌐 Domain should now work at https://everjust.chat"
EOF

echo "Uploading files to server..."
scp rocketchat-nginx.conf root@${SERVER_IP}:/tmp/
scp setup-server.sh root@${SERVER_IP}:/tmp/

echo "Executing setup on server..."
ssh root@${SERVER_IP} "chmod +x /tmp/setup-server.sh && /tmp/setup-server.sh"

echo ""
echo "✅ Server configuration complete!"
echo "🌐 Your Rocket.Chat should now be accessible at: https://everjust.chat"
echo ""
echo "Note: DNS may take a few minutes to propagate."
