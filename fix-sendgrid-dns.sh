#!/bin/bash

# Fix SendGrid tracking domain DNS by removing CNAME and adding A record
# This resolves the SSL certificate issue for url3965.everjust.com

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

echo -e "${BLUE}🔧 Fixing SendGrid tracking domain DNS${NC}"
echo -e "${BLUE}====================================${NC}"
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

# Check current records
echo -e "${YELLOW}🔍 Checking current records for ${SUBDOMAIN}.${DOMAIN}${NC}"
echo "CNAME records:"
cname_records=$(godaddy_api "GET" "/records/CNAME/${SUBDOMAIN}")
echo "$cname_records" | jq -r '.[] | "  \(.type) \(.name) → \(.data) (TTL: \(.ttl))"' 2>/dev/null || echo "  No CNAME records found"

echo "A records:"
a_records=$(godaddy_api "GET" "/records/A/${SUBDOMAIN}")
echo "$a_records" | jq -r '.[] | "  \(.type) \(.name) → \(.data) (TTL: \(.ttl))"' 2>/dev/null || echo "  No A records found"
echo ""

# Remove CNAME record if it exists
echo -e "${YELLOW}🗑️  Removing CNAME record for ${SUBDOMAIN}${NC}"
delete_result=$(godaddy_api "DELETE" "/records/CNAME/${SUBDOMAIN}")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CNAME record removed (or didn't exist)${NC}"
else
    echo -e "${YELLOW}⚠️  CNAME record removal failed or didn't exist${NC}"
fi

# Wait a moment for the deletion to process
sleep 2

# Add A record
echo -e "${YELLOW}➕ Adding A record: ${SUBDOMAIN} → ${SERVER_IP}${NC}"
a_record_data='[{"data":"'$SERVER_IP'","ttl":600}]'
result=$(godaddy_api "PUT" "/records/A/${SUBDOMAIN}" "$a_record_data")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ A record added successfully${NC}"
else
    echo -e "${RED}❌ Error adding A record${NC}"
    echo "$result"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ DNS fix complete!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "Domain: ${SUBDOMAIN}.${DOMAIN}"
echo "Old: CNAME → sendgrid.net (removed)"
echo "New: A → ${SERVER_IP}"
echo "TTL: 600 seconds (10 minutes)"
echo ""
echo -e "${YELLOW}⏰ DNS propagation may take 5-30 minutes${NC}"
echo -e "${YELLOW}🔍 Test with: dig ${SUBDOMAIN}.${DOMAIN}${NC}"
