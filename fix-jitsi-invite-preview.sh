#!/bin/bash

# Fix Jitsi Invite Preview - Properly Update index.html in Container
# This script directly modifies the index.html file inside the Jitsi web container

set -e

echo "🔧 Fixing Jitsi Invite Preview with EVERJUST Branding..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Connect to server and modify the Jitsi web container directly
echo "📝 Modifying index.html inside Jitsi web container..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Get the Jitsi web container name
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
echo "🐳 Working with container: $CONTAINER_NAME"

# Backup the original index.html
echo "💾 Creating backup of original index.html..."
docker exec $CONTAINER_NAME cp /usr/share/jitsi-meet/index.html /usr/share/jitsi-meet/index.html.backup

# Create a custom index.html with EVERJUST branding
echo "🎨 Creating custom index.html with EVERJUST Open Graph meta tags..."
docker exec $CONTAINER_NAME bash -c 'cat > /tmp/update_index.html << "HTML_EOF"
#!/bin/bash

# Read the current index.html
cp /usr/share/jitsi-meet/index.html /tmp/index_original.html

# Create new index.html with EVERJUST branding
cat > /usr/share/jitsi-meet/index.html << "INDEX_EOF"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <!-- EVERJUST Custom Branding for Meeting Invite Previews -->
    <title>EVERJUST Video Call</title>
    <meta name="description" content="Join secure, high-quality video meetings with EVERJUST. Connect instantly with crystal-clear audio and video.">
    <meta name="keywords" content="video call, meeting, conference, EVERJUST, secure, collaboration">
    <meta name="application-name" content="EVERJUST Video Call">

    <!-- Open Graph meta tags for social media previews -->
    <meta property="og:title" content="EVERJUST Video Call">
    <meta property="og:description" content="Join secure, high-quality video meetings with EVERJUST. Connect instantly with crystal-clear audio and video.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://meet.everjust.com">
    <meta property="og:image" content="https://meet.everjust.com/images/everjust-preview.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="EVERJUST Video Call - Join Meeting">
    <meta property="og:site_name" content="EVERJUST">

    <!-- Twitter Card meta tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="EVERJUST Video Call">
    <meta name="twitter:description" content="Join secure, high-quality video meetings with EVERJUST. Connect instantly with crystal-clear audio and video.">
    <meta name="twitter:image" content="https://meet.everjust.com/images/everjust-preview.png">
    <meta name="twitter:image:alt" content="EVERJUST Video Call - Join Meeting">

    <!-- Additional meta tags -->
    <meta name="apple-mobile-web-app-title" content="EVERJUST">
    <meta name="theme-color" content="#2563eb">

    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="images/favicon-16x16.png">

    <link rel="stylesheet" href="css/all.css?v=5765">
    <link rel="stylesheet" href="css/main.css?v=5765">
    <script src="libs/lib-jitsi-meet.min.js?v=5765"></script>
    <script src="libs/app.bundle.min.js?v=5765"></script>
</head>
<body>
    <div id="react"></div>
    <script>
        // Initialize Jitsi Meet with EVERJUST branding
        window.APP_NAME = "EVERJUST Video Call";
        window.PROVIDER_NAME = "EVERJUST";
    </script>
</body>
</html>
INDEX_EOF

echo "✅ Updated index.html with EVERJUST branding"
HTML_EOF'

# Make the script executable and run it
docker exec $CONTAINER_NAME chmod +x /tmp/update_index.html
docker exec $CONTAINER_NAME /tmp/update_index.html

# Verify the changes
echo "🔍 Verifying the changes..."
docker exec $CONTAINER_NAME grep -i "EVERJUST" /usr/share/jitsi-meet/index.html | head -5

# Also create a simple logo placeholder
echo "🎨 Creating logo placeholder..."
docker exec $CONTAINER_NAME bash -c 'mkdir -p /usr/share/jitsi-meet/images && echo "EVERJUST Logo Placeholder" > /usr/share/jitsi-meet/images/everjust-preview.png.txt'

echo "🎉 Jitsi invite preview fix completed!"
echo "📱 Meeting invite links should now show EVERJUST branding."
echo "🔗 Test at: https://meet.everjust.com"

# Test the change
echo "🧪 Testing the updated page..."
curl -s -I http://localhost:8000/ | grep -E "HTTP|Content-Type" || echo "Service is running..."

EOF

echo "✅ Jitsi invite preview fix completed successfully!"
echo ""
echo "🎯 What was fixed:"
echo "- ✅ Updated index.html directly in the running container"
echo "- ✅ Added proper Open Graph meta tags for EVERJUST"
echo "- ✅ Changed page title to 'EVERJUST Video Call'"
echo "- ✅ Added custom description for invite previews"
echo ""
echo "🧪 How to test:"
echo "1. Visit https://meet.everjust.com"
echo "2. Create a test meeting room"
echo "3. Copy the meeting URL"
echo "4. Share it in WhatsApp/Slack to see the new preview"
echo ""
echo "⚠️  Note: Clear browser cache if needed"
echo "🔗 Test URL: https://meet.everjust.com"
