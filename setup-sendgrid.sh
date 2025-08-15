#!/bin/bash

# SendGrid Setup Script for EVERJUST Chat
# This script configures SendGrid email for Rocket.Chat

set -e

echo "🚀 EVERJUST Chat - SendGrid Email Setup"
echo "======================================"
echo ""

# Check if SENDGRID_API_KEY is provided
if [ -z "$1" ]; then
    echo "❌ Error: SendGrid API key required"
    echo ""
    echo "Usage: ./setup-sendgrid.sh YOUR_SENDGRID_API_KEY"
    echo ""
    echo "Get your API key from: https://app.sendgrid.com/settings/api_keys"
    echo ""
    exit 1
fi

SENDGRID_API_KEY="$1"

echo "📧 Configuring SendGrid with API key: ${SENDGRID_API_KEY:0:10}..."
echo ""

# Export the environment variable
export SENDGRID_API_KEY="$SENDGRID_API_KEY"

# Check if we're in a Docker environment
if [ -f "/opt/rocketchat/docker-compose.yml" ]; then
    echo "🐳 Docker environment detected"
    cd /opt/rocketchat

    # Create .env file
    echo "SENDGRID_API_KEY=$SENDGRID_API_KEY" > .env

    # Restart Rocket.Chat service
    echo "🔄 Restarting Rocket.Chat services..."
    docker-compose restart rocketchat

    echo ""
    echo "✅ SendGrid configuration complete!"
    echo "📧 Email functionality should now be working"
    echo ""
    echo "Test by:"
    echo "1. Go to https://everjust.chat"
    echo "2. Try registering a new account"
    echo "3. Check your email for verification"

elif [ -f "droplet-deployment/docker-compose.yml" ]; then
    echo "🔧 Development environment detected"
    cd droplet-deployment

    # Create .env file
    echo "SENDGRID_API_KEY=$SENDGRID_API_KEY" > .env

    echo ""
    echo "✅ SendGrid API key saved to .env file"
    echo "📧 Deploy using: docker-compose up -d"

else
    echo "❌ Error: Rocket.Chat installation not found"
    echo "Please run this script from the project root or on the deployed server"
    exit 1
fi

echo ""
echo "📋 SendGrid Setup Complete!"
echo "================================"
echo "From Email: support@everjust.com"
echo "SMTP Server: smtp.sendgrid.net:465"
echo "API Key: ${SENDGRID_API_KEY:0:10}***"
echo ""
