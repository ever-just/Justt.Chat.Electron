#!/bin/bash

# Set up clean SendGrid link branding with a professional subdomain
# This replaces the auto-generated url3965.everjust.com with a clean subdomain

set -e

# Configuration
DOMAIN="everjust.com"
LINK_SUBDOMAIN="links"  # This will create links.everjust.com
SERVER_IP="159.65.185.227"
API_KEY="gHKhkafh4D1G_4ntPnuc84hFA2W8bwtQ8KU"
API_SECRET="81sQWbJhgejgv4Dsmpf27Y"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔗 Setting up SendGrid Link Branding${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

echo -e "${YELLOW}📋 WHAT THIS DOES:${NC}"
echo "1. Creates a clean subdomain: ${LINK_SUBDOMAIN}.${DOMAIN}"
echo "2. Adds DNS CNAME record pointing to SendGrid"
echo "3. Replaces ugly url3965.everjust.com with professional branding"
echo "4. Makes email links look like: https://${LINK_SUBDOMAIN}.${DOMAIN}/..."
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
            "https://api.godaddy.com/v1/domains/${DOMAIN}/records${endpoint}"
    else
        curl -s -X "$method" \
            -H "Authorization: sso-key ${API_KEY}:${API_SECRET}" \
            "https://api.godaddy.com/v1/domains/${DOMAIN}/records${endpoint}"
    fi
}

# Function to add CNAME record for SendGrid link branding
add_link_branding_cname() {
    local subdomain=$1

    echo -e "${BLUE}🌐 Adding CNAME record for ${subdomain}.${DOMAIN}${NC}"

    # Remove existing record if it exists
    godaddy_api "DELETE" "/CNAME/${subdomain}" 2>/dev/null || true

    # Add new CNAME record pointing to SendGrid
    local record_data='[{"data": "sendgrid.net", "ttl": 3600}]'
    local response=$(godaddy_api "PUT" "/CNAME/${subdomain}" "$record_data")

    if [ -z "$response" ]; then
        echo -e "${GREEN}✅ CNAME record added: ${subdomain}.${DOMAIN} → sendgrid.net${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to add CNAME record: $response${NC}"
        return 1
    fi
}

# Main execution
echo -e "${YELLOW}🔧 Step 1: Adding DNS CNAME record${NC}"
if add_link_branding_cname "$LINK_SUBDOMAIN"; then
    echo ""
    echo -e "${GREEN}✅ DNS Configuration Complete!${NC}"
    echo ""
    echo -e "${YELLOW}📋 NEXT STEPS IN SENDGRID:${NC}"
    echo "1. Go to SendGrid → Settings → Sender Authentication"
    echo "2. In the 'Link Branding' section, click 'Brand Your Links'"
    echo "3. Enter your subdomain: ${LINK_SUBDOMAIN}.${DOMAIN}"
    echo "4. SendGrid will verify the DNS automatically"
    echo "5. Once verified, all email links will use this clean domain"
    echo ""
    echo -e "${BLUE}🎯 RESULT:${NC}"
    echo "Your email links will change from:"
    echo "  ❌ url3965.everjust.com/click/..."
    echo "  ✅ ${LINK_SUBDOMAIN}.${DOMAIN}/click/..."
    echo ""
    echo -e "${YELLOW}⚠️  NOTE:${NC}"
    echo "After setting this up in SendGrid, you can remove the old"
    echo "url3965.everjust.com domain from your SSL certificate if desired."
else
    echo -e "${RED}❌ Failed to configure DNS. Please check your API credentials.${NC}"
    exit 1
fi
