#!/bin/bash

# Test user registration email functionality
# Run this AFTER completing the setup wizard

SERVER_IP="159.65.185.227"
DOMAIN="everjust.chat"
PASSWORD="Weldon@80K"

echo "📧 Testing User Registration Email Functionality"
echo "==============================================="
echo ""

echo "🔍 Checking current email configuration..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << 'EOF'
cd /opt/rocketchat

echo "📋 Environment Variables:"
docker-compose exec -T rocketchat env | grep -E "(MAIL_URL|From_Email)"

echo ""
echo "📊 Recent Rocket.Chat logs (email-related):"
docker-compose logs rocketchat --tail=20 2>/dev/null | grep -i -E "(mail|email|smtp|sendgrid)" | tail -5

echo ""
echo "🔧 Container Status:"
docker-compose ps rocketchat

echo ""
echo "🌐 Testing web access:"
curl -s -I http://localhost:3000 | head -3
EOF

echo ""
echo "🎯 Manual Test Instructions:"
echo "1. Go to: https://$DOMAIN"
echo "2. Complete the setup wizard if not done"
echo "3. Login as admin"
echo "4. Go to Administration > Users"
echo "5. Click 'Add User'"
echo "6. Fill in user details with a real email address"
echo "7. Enable 'Send welcome email'"
echo "8. Click 'Save'"
echo ""
echo "📧 Check SendGrid Dashboard:"
echo "- Login to SendGrid"
echo "- Go to Activity Feed"
echo "- Look for emails sent to the test user"
echo ""
echo "🔍 Monitor logs in real-time:"
echo "ssh root@$SERVER_IP 'cd /opt/rocketchat && docker-compose logs -f rocketchat | grep -i email'"
