#!/bin/bash

# Add SendGrid tracking domain to everjust.com DNS
# This fixes the SSL certificate issue for url3965.everjust.com

set -e

# Configuration
DOMAIN="everjust.com"
SUBDOMAIN="url3965"
SERVER_IP="159.65.185.227"
API_KEY="gHKhkafh4D1G_4ntPnuc84hFA2W8bwtQ8KU"
API_SECRET="81sQWbJhgejgv4Dsmpf27Y"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔐 Adding SendGrid tracking domain to DNS${NC}"
echo -e "${BLUE}=======================================${NC}"
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

# Check if subdomain already exists
echo -e "${YELLOW}🔍 Checking current DNS records for ${SUBDOMAIN}.${DOMAIN}${NC}"
existing_record=$(godaddy_api "GET" "/records/A/${SUBDOMAIN}")

if echo "$existing_record" | grep -q "data"; then
    echo -e "${YELLOW}⚠️  Record already exists:${NC}"
    echo "$existing_record" | jq -r '.[] | "  \(.type) \(.name) → \(.data) (TTL: \(.ttl))"'
    echo ""
    echo -e "${YELLOW}📝 Updating existing record...${NC}"
else
    echo -e "${GREEN}✅ No existing record found, creating new one...${NC}"
fi

# Add/Update A record for SendGrid tracking subdomain
echo -e "${YELLOW}➕ Adding A record: ${SUBDOMAIN} → ${SERVER_IP}${NC}"
a_record_data='[{"data":"'$SERVER_IP'","ttl":600}]'
result=$(godaddy_api "PUT" "/records/A/${SUBDOMAIN}" "$a_record_data")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ A record added/updated successfully${NC}"
else
    echo -e "${RED}❌ Error adding A record${NC}"
    echo "$result"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ SendGrid tracking domain setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "Domain: ${SUBDOMAIN}.${DOMAIN}"
echo "Points to: ${SERVER_IP}"
echo "TTL: 600 seconds (10 minutes)"
echo ""
echo -e "${YELLOW}⏰ DNS propagation may take 5-30 minutes${NC}"
echo -e "${YELLOW}🔍 Test with: dig ${SUBDOMAIN}.${DOMAIN}${NC}"
echo ""
echo -e "${BLUE}🔐 Next steps:${NC}"
echo "1. Wait for DNS propagation"
echo "2. Add ${SUBDOMAIN}.${DOMAIN} to SSL certificate"
echo "3. Update nginx configuration"
