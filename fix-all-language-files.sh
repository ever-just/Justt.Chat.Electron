#!/bin/bash

# Fix ALL Language Files - Update Every Single Language File
# This script updates ALL 50+ language files that contain "Jitsi Meet" text

set -e

echo "🌍 Fixing ALL Jitsi Language Files for EVERJUST Branding..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Connect to server and fix ALL language files
echo "🔄 Updating ALL language files on server..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Get container name
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
echo "🐳 Working with container: $CONTAINER_NAME"

echo "🌍 FIXING ALL LANGUAGE FILES - This is the real solution!"
echo "======================================================="

# Update ALL language files at once
docker exec $CONTAINER_NAME bash -c '
echo "📝 Updating ALL 50+ language files with EVERJUST branding..."

# Change to the lang directory
cd /usr/share/jitsi-meet/lang

# Update ALL files that contain "Jitsi Meet" to "EVERJUST MEET"
for file in *.json; do
    if grep -q "Jitsi Meet" "$file"; then
        echo "Updating $file..."
        sed -i "s/\"Jitsi Meet\"/\"EVERJUST MEET\"/g" "$file"
        sed -i "s/Jitsi Meet/EVERJUST MEET/g" "$file"
    fi
done

# Update ALL files that contain the subtitle to remove it
for file in *.json; do
    if grep -q "Secure and high quality meetings" "$file"; then
        echo "Removing subtitle from $file..."
        sed -i "s/\"Secure and high quality meetings\"/\"\"/g" "$file"
        sed -i "s/Secure and high quality meetings//g" "$file"
    fi
done

# Update headerTitle and headerSubtitle specifically
for file in *.json; do
    if grep -q "headerTitle" "$file"; then
        echo "Updating headerTitle in $file..."
        sed -i "s/\"headerTitle\": \".*\"/\"headerTitle\": \"EVERJUST MEET\"/g" "$file"
    fi
    if grep -q "headerSubtitle" "$file"; then
        echo "Removing headerSubtitle in $file..."
        sed -i "s/\"headerSubtitle\": \".*\"/\"headerSubtitle\": \"\"/g" "$file"
    fi
done

echo "✅ Updated all language files!"

# Verify the changes in main.json
echo ""
echo "📋 Verification - main.json content:"
grep -A 1 -B 1 "headerTitle\|headerSubtitle" main.json

# Also update the manifest.json
echo ""
echo "📝 Updating manifest.json..."
sed -i "s/\"Jitsi Meet\"/\"EVERJUST MEET\"/g" manifest.json
sed -i "s/Jitsi Meet/EVERJUST MEET/g" manifest.json

echo "✅ All language files and manifest updated!"
'

echo "🔄 Restarting Jitsi web container to apply language changes..."
docker-compose -f jitsi-docker-compose.yml restart jitsi-web

echo "✅ Language file fix completed!"
EOF

echo "🎯 All language files updated successfully!"
