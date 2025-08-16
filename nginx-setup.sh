#!/bin/bash

# Run this script ON THE SERVER (159.65.185.227) to configure Nginx
echo "🚀 Setting up Nginx reverse proxy for Rocket.Chat..."

# Install Nginx and Certbot
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

# Create Nginx configuration for Rocket.Chat
cat > /etc/nginx/sites-available/rocketchat << 'EOF'
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

# Enable the site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/rocketchat /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"

    # Restart Nginx
    systemctl restart nginx
    systemctl enable nginx

    echo "✅ Nginx is now running and serving Rocket.Chat on port 80"

    # Set up SSL certificate
    echo "🔒 Setting up SSL certificate..."
    certbot --nginx -d everjust.chat --non-interactive --agree-tos --email company@everjust.com --redirect

    if [ $? -eq 0 ]; then
        echo "✅ SSL certificate installed successfully!"
        echo "🌐 Rocket.Chat is now accessible at: https://everjust.chat"
    else
        echo "⚠️  SSL setup failed, but HTTP should work at: http://everjust.chat"
    fi
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo "🌐 Test your Rocket.Chat at: https://everjust.chat"
