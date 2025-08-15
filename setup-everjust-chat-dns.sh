#!/bin/bash

# Setup DNS for everjust.chat domain
# This script adds the A record to point everjust.chat to the Rocket.Chat server

set -e

# Configuration
DOMAIN="everjust.chat"
SERVER_IP="159.65.185.227"
API_KEY="gHKhkafh4D1G_4ntPnuc84hFA2W8bwtQ8KU"
API_SECRET="81sQWbJhgejgv4Dsmpf27Y"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Setting up DNS for everjust.chat${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Function to make GoDaddy API calls
godaddy_api() {
    local method=$1
    local endpoint=$2
    local data=$3

    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: sso-key ${API_KEY}:${API_SECRET}" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "https://api.godaddy.com/v1/domains/${DOMAIN}${endpoint}"
    else
        curl -s -X "$method" \
            -H "Authorization: sso-key ${API_KEY}:${API_SECRET}" \
            "https://api.godaddy.com/v1/domains/${DOMAIN}${endpoint}"
    fi
}

# Check current DNS records
echo -e "${YELLOW}📋 Current DNS records for ${DOMAIN}:${NC}"
current_records=$(godaddy_api "GET" "/records")
echo "$current_records" | jq -r '.[] | "\(.type)\t\(.name)\t\(.data)\t\(.ttl)"' | \
awk 'BEGIN{printf "%-8s %-20s %-50s %-8s\n", "TYPE", "NAME", "DATA", "TTL"; print "="*90} {printf "%-8s %-20s %-50s %-8s\n", $1, $2, $3, $4}'
echo ""

# Add A record for root domain
echo -e "${YELLOW}➕ Adding A record: @ → ${SERVER_IP}${NC}"
a_record_data='[{"data":"'$SERVER_IP'","ttl":600}]'
result=$(godaddy_api "PUT" "/records/A/@" "$a_record_data")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ A record added successfully${NC}"
else
    echo -e "${RED}❌ Error adding A record${NC}"
    echo "$result"
    exit 1
fi

# Add www CNAME record (optional)
echo -e "${YELLOW}➕ Adding CNAME record: www → everjust.chat${NC}"
cname_record_data='[{"data":"everjust.chat","ttl":600}]'
result=$(godaddy_api "PUT" "/records/CNAME/www" "$cname_record_data")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CNAME record added successfully${NC}"
else
    echo -e "${YELLOW}⚠️  CNAME record may already exist or failed to add${NC}"
fi

echo ""
echo -e "${GREEN}✅ DNS setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "Domain: everjust.chat"
echo "Server IP: ${SERVER_IP}"
echo "A Record: @ → ${SERVER_IP}"
echo "CNAME Record: www → everjust.chat"
echo ""
echo -e "${YELLOW}⏰ DNS propagation may take 5-48 hours${NC}"
echo -e "${YELLOW}🔍 Test with: dig everjust.chat${NC}"
echo ""
echo -e "${BLUE}🌐 Your Rocket.Chat will be accessible at:${NC}"
echo "  - https://everjust.chat"
echo "  - https://www.everjust.chat"
