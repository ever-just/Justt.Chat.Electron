#!/bin/bash

# GoDaddy DNS Manager for SendGrid Integration
# This script manages DNS records for everjust.com via GoDaddy API

set -e

# GoDaddy API Credentials
API_KEY="gHKhkafh4D1G_4ntPnuc84hFA2W8bwtQ8KU"
API_SECRET="81sQWbJhgejgv4Dsmpf27Y"
DOMAIN="everjust.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 GoDaddy DNS Manager for SendGrid Integration${NC}"
echo -e "${BLUE}================================================${NC}"
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

# Function to get current DNS records
get_dns_records() {
    echo -e "${YELLOW}📋 Current DNS Records for ${DOMAIN}:${NC}"
    echo ""

    local records=$(godaddy_api "GET" "/records")

    if [ $? -eq 0 ]; then
        echo "$records" | jq -r '.[] | "\(.type)\t\(.name)\t\(.data)\t\(.ttl)"' | \
        awk 'BEGIN{printf "%-8s %-20s %-50s %-8s\n", "TYPE", "NAME", "DATA", "TTL"; print "="*90} {printf "%-8s %-20s %-50s %-8s\n", $1, $2, $3, $4}'
    else
        echo -e "${RED}❌ Error fetching DNS records${NC}"
        exit 1
    fi
    echo ""
}

# Function to add CNAME record
add_cname_record() {
    local name=$1
    local value=$2
    local ttl=${3:-600}

    echo -e "${YELLOW}➕ Adding CNAME record: ${name} → ${value}${NC}"

    local data='[{"data":"'$value'","ttl":'$ttl'}]'
    local result=$(godaddy_api "PUT" "/records/CNAME/${name}" "$data")

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ CNAME record added successfully${NC}"
    else
        echo -e "${RED}❌ Error adding CNAME record${NC}"
        echo "$result"
    fi
    echo ""
}

# Function to add TXT record
add_txt_record() {
    local name=$1
    local value=$2
    local ttl=${3:-600}

    echo -e "${YELLOW}➕ Adding TXT record: ${name} → ${value}${NC}"

    local data='[{"data":"'$value'","ttl":'$ttl'}]'
    local result=$(godaddy_api "PUT" "/records/TXT/${name}" "$data")

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ TXT record added successfully${NC}"
    else
        echo -e "${RED}❌ Error adding TXT record${NC}"
        echo "$result"
    fi
    echo ""
}

# Function to verify API access
verify_api_access() {
    echo -e "${YELLOW}🔍 Verifying GoDaddy API access...${NC}"

    local result=$(godaddy_api "GET" "")

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ API access verified${NC}"
        echo "Domain: $(echo "$result" | jq -r '.domain // "N/A"')"
        echo ""
    else
        echo -e "${RED}❌ API access failed${NC}"
        echo "Note: As of May 2024, GoDaddy requires either 10+ domains or Discount Domain Club subscription for API access"
        echo "$result"
        exit 1
    fi
}

# Main menu
show_menu() {
    echo -e "${BLUE}Choose an action:${NC}"
    echo "1. Verify API Access"
    echo "2. View Current DNS Records"
    echo "3. Add SendGrid DKIM Records (CNAME)"
    echo "4. Add DMARC Record (TXT)"
    echo "5. Add Custom Record"
    echo "6. Exit"
    echo ""
}

# SendGrid DKIM records (example - you'll need the actual values from SendGrid)
add_sendgrid_dkim() {
    echo -e "${YELLOW}📧 Adding SendGrid DKIM Records${NC}"
    echo -e "${RED}⚠️  You need to get these values from SendGrid Domain Authentication settings!${NC}"
    echo ""

    # Example records - replace with actual values from SendGrid
    echo "Please go to SendGrid → Settings → Sender Authentication → Domain Authentication"
    echo "And get the actual CNAME records to add here"
    echo ""

    # Uncomment and modify these with actual SendGrid values:
    # add_cname_record "s1._domainkey" "s1.domainkey.uXXXXXX.wl001.sendgrid.net"
    # add_cname_record "s2._domainkey" "s2.domainkey.uXXXXXX.wl001.sendgrid.net"
}

# DMARC record
add_dmarc_record() {
    echo -e "${YELLOW}🛡️  Adding DMARC Record${NC}"
    add_txt_record "_dmarc" "v=DMARC1; p=quarantine; rua=mailto:support@everjust.com; ruf=mailto:support@everjust.com; fo=1"
}

# Interactive mode
if [ "$1" = "interactive" ] || [ $# -eq 0 ]; then
    while true; do
        show_menu
        read -p "Enter your choice (1-6): " choice
        echo ""

        case $choice in
            1) verify_api_access ;;
            2) get_dns_records ;;
            3) add_sendgrid_dkim ;;
            4) add_dmarc_record ;;
            5)
                read -p "Record type (CNAME/TXT): " type
                read -p "Record name: " name
                read -p "Record value: " value
                read -p "TTL (default 600): " ttl
                ttl=${ttl:-600}

                if [ "$type" = "CNAME" ]; then
                    add_cname_record "$name" "$value" "$ttl"
                elif [ "$type" = "TXT" ]; then
                    add_txt_record "$name" "$value" "$ttl"
                else
                    echo -e "${RED}❌ Unsupported record type${NC}"
                fi
                ;;
            6)
                echo -e "${GREEN}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid choice${NC}"
                ;;
        esac

        echo ""
        read -p "Press Enter to continue..."
        echo ""
    done
fi

# Command line usage
case "$1" in
    "list") get_dns_records ;;
    "verify") verify_api_access ;;
    "dmarc") add_dmarc_record ;;
    *)
        echo "Usage: $0 [interactive|list|verify|dmarc]"
        echo "  interactive: Run in interactive mode (default)"
        echo "  list: Show current DNS records"
        echo "  verify: Verify API access"
        echo "  dmarc: Add DMARC record"
        ;;
esac
