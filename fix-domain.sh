#!/bin/bash

# Fix everjust.chat domain configuration
echo "🚀 Fixing everjust.chat domain configuration..."

SERVER_IP="159.65.185.227"
DOMAIN="everjust.chat"
GODADDY_API_KEY="gHKhkafh4D1G_4ntPnuc84hFA2W8bwtQ8KU"
GODADDY_SECRET="81sQWbJhgejgv4Dsmpf27Y"

echo "Step 1: Updating DNS to point to correct IP..."

# Update GoDaddy DNS record
curl -X PUT "https://api.godaddy.com/v1/domains/everjust.com/records/A/chat" \
  -H "Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_SECRET}" \
  -H "Content-Type: application/json" \
  -d "[{\"data\": \"${SERVER_IP}\", \"ttl\": 600}]"

echo ""
echo "Step 2: Configuring server nginx proxy..."

# Create nginx configuration script
cat > nginx-setup.sh << 'EOF'
#!/bin/bash
echo "Installing/configuring Nginx..."

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
fi

# Create nginx config for Rocket.Chat
cat > /etc/nginx/sites-available/rocketchat << 'NGINXCONF'
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
NGINXCONF

# Enable the site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/rocketchat /etc/nginx/sites-enabled/

# Test and reload nginx
nginx -t && systemctl reload nginx
systemctl enable nginx

echo "Nginx configured successfully!"
EOF

# Copy and execute on server
echo "Uploading nginx configuration to server..."
scp nginx-setup.sh root@${SERVER_IP}:/tmp/
ssh root@${SERVER_IP} "chmod +x /tmp/nginx-setup.sh && /tmp/nginx-setup.sh"

echo ""
echo "Step 3: Setting up SSL certificate..."
ssh root@${SERVER_IP} "apt-get install -y certbot python3-certbot-nginx && certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email company@everjust.com"

echo ""
echo "✅ Domain configuration complete!"
echo "🌐 Your Rocket.Chat should now be accessible at: https://${DOMAIN}"
echo ""
echo "Please test the connection in a few minutes for DNS propagation."
