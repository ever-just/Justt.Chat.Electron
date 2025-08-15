# Rocket.Chat Deployment on DigitalOcean Droplet

This guide provides a complete solution for deploying Rocket.Chat on a DigitalOcean Droplet using Docker Compose.

## Prerequisites

1. **DigitalOcean Account** with ability to create Droplets
2. **Domain Name** (everjust.chat) with access to DNS settings
3. **Basic SSH knowledge**

## Step 1: Create a DigitalOcean Droplet

1. Log into your DigitalOcean account
2. Click "Create" → "Droplets"
3. Choose the following configuration:
   - **Image**: Ubuntu 22.04 LTS x64
   - **Plan**: Basic
   - **CPU Options**: Regular (Intel with SSD)
   - **Size**: At least 2 GB RAM / 2 vCPUs (for production, 4 GB RAM recommended)
   - **Region**: Choose closest to your users
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: `rocketchat-everjust`

4. Click "Create Droplet"

## Step 2: Configure DNS

1. In your domain registrar (GoDaddy):
   - Create an A record for `everjust.chat`
   - Point it to your Droplet's IP address
   - TTL: 600 seconds (for faster propagation during setup)

2. Wait for DNS propagation (usually 5-15 minutes)

## Step 3: Connect to Your Droplet

```bash
ssh root@<your-droplet-ip>
```

## Step 4: Run the Deployment Script

1. Upload the deployment script:
```bash
# Create directory
mkdir -p /opt/scripts
cd /opt/scripts

# Create the script
nano deploy-rocketchat.sh
```

2. Copy the contents of `deploy-rocketchat.sh` into the editor

3. Make it executable and run:
```bash
chmod +x deploy-rocketchat.sh
./deploy-rocketchat.sh
```

## Step 5: Secure with SSL Certificate

After the script completes and your DNS is properly configured:

```bash
certbot --nginx -d everjust.chat
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to share email with EFF
- The certificate will be automatically configured

## Step 6: Access Rocket.Chat

1. Open your browser and navigate to: `https://everjust.chat`
2. Complete the setup wizard:
   - Create admin account
   - Configure organization info
   - Register your server (optional but recommended)

## Managing Rocket.Chat

### View Logs
```bash
cd /opt/rocketchat
docker-compose logs -f
```

### Stop Rocket.Chat
```bash
cd /opt/rocketchat
docker-compose down
```

### Start Rocket.Chat
```bash
cd /opt/rocketchat
docker-compose up -d
```

### Update Rocket.Chat
```bash
cd /opt/rocketchat
docker-compose pull
docker-compose up -d
```

### Backup MongoDB
```bash
cd /opt/rocketchat
docker-compose exec mongo mongodump --archive=/dump/backup.archive --db=rocketchat
docker cp $(docker-compose ps -q mongo):/dump/backup.archive ./backups/
```

### Restore MongoDB
```bash
cd /opt/rocketchat
docker cp ./backups/backup.archive $(docker-compose ps -q mongo):/dump/
docker-compose exec mongo mongorestore --archive=/dump/backup.archive
```

## Monitoring and Maintenance

### Check Resource Usage
```bash
docker stats
```

### Check Disk Space
```bash
df -h
```

### Setup Automatic Backups (Optional)
Create a cron job for regular backups:
```bash
crontab -e
```

Add:
```
0 2 * * * cd /opt/rocketchat && docker-compose exec -T mongo mongodump --archive=/dump/backup-$(date +\%Y\%m\%d).archive --db=rocketchat
```

## Troubleshooting

### Container Won't Start
```bash
cd /opt/rocketchat
docker-compose logs mongo
docker-compose logs rocketchat
```

### MongoDB Connection Issues
1. Ensure MongoDB is running:
```bash
docker-compose ps
```

2. Check MongoDB logs:
```bash
docker-compose logs mongo
```

3. Verify replica set:
```bash
docker-compose exec mongo mongosh --eval "rs.status()"
```

### SSL Certificate Issues
```bash
certbot renew --dry-run  # Test renewal
certbot renew             # Force renewal
```

### Performance Issues
1. Check server resources:
```bash
htop
```

2. Increase swap (if needed):
```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

## Security Recommendations

1. **Enable UFW Firewall**:
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

2. **Disable Root Login** (after creating a sudo user):
```bash
adduser everjust
usermod -aG sudo everjust
# Then edit /etc/ssh/sshd_config and set PermitRootLogin no
```

3. **Keep System Updated**:
```bash
apt update && apt upgrade -y
```

4. **Enable Automatic Security Updates**:
```bash
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

## Estimated Costs

- **Droplet**: $12-24/month (2-4GB RAM)
- **Backup**: $2-4/month (optional)
- **Total**: ~$14-28/month

## Advantages Over App Platform

1. **Full Control**: Direct access to containers and configurations
2. **No Platform Limitations**: No caching issues or connection string problems
3. **Cost Effective**: Single droplet can host everything
4. **Easier Debugging**: Direct access to logs and MongoDB
5. **Proven Solution**: Community-tested approach

## Support

For issues or questions:
1. Check Rocket.Chat logs: `docker-compose logs -f`
2. Visit [Rocket.Chat Forums](https://forums.rocket.chat/)
3. Check [Docker Hub](https://hub.docker.com/r/rocketchat/rocket.chat) for version info
