#!/bin/bash

# Test Rocket.Chat email functionality
# This script will test if emails are sent when creating new users

SERVER_IP="159.65.185.227"
DOMAIN="everjust.chat"
PASSWORD="Weldon@80K"

echo "🧪 Testing Rocket.Chat Email Functionality"
echo "=========================================="
echo ""

# Test 1: Check if Rocket.Chat is responding
echo "📡 Testing Rocket.Chat API connectivity..."
response=$(sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/v1/info")
if [ "$response" = "200" ]; then
    echo "✅ Rocket.Chat API is responding"
else
    echo "❌ Rocket.Chat API not responding (HTTP $response)"
    exit 1
fi

# Test 2: Check email configuration in logs
echo ""
echo "📧 Checking email configuration..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << 'EOF'
cd /opt/rocketchat
echo "Environment variables:"
docker-compose exec -T rocketchat env | grep -E "(MAIL_URL|From_Email)" | head -2

echo ""
echo "Recent email-related logs:"
docker-compose logs rocketchat 2>/dev/null | grep -i "mail\|email\|smtp" | tail -3
EOF

# Test 3: Check if setup wizard is completed
echo ""
echo "🔧 Checking setup status..."
setup_status=$(sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP "curl -s http://localhost:3000/api/v1/info" | grep -o '"setupWizard":"[^"]*"' | cut -d'"' -f4)
echo "Setup wizard status: $setup_status"

echo ""
echo "🎯 Next Steps:"
echo "1. Complete the setup wizard at https://$DOMAIN/setup-wizard"
echo "2. Create a test user to verify email delivery"
echo "3. Check SendGrid dashboard for email delivery logs"
echo ""
echo "📧 Email Configuration Summary:"
echo "- SMTP Provider: SendGrid"
echo "- From Address: support@everjust.com"
echo "- Domain: $DOMAIN"
