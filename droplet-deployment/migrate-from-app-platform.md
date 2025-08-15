# Migrating from DigitalOcean App Platform to Droplet

Since the App Platform deployment has been experiencing persistent issues, here's how to migrate to a Droplet-based solution.

## Current Situation

### Failed Resources on App Platform
1. **App**: `everjust-chat` (ID: 57a12538-5c44-416d-a0d2-7f8248a18844)
2. **App**: `everjust-chat-v2` (ID: 1c26f0d5-3f01-4456-992d-cb5ca5fe957d)
3. **MongoDB Cluster**: `everjust-chat-mongo` (ID: 189b1950-95e5-418d-bd7e-12676c94c1de)
4. **MongoDB User**: `rocketchat` (password: c2K8739L14vJ5zgW)

### Issues Encountered
- MongoDB connection string cache issues
- ReplicaSetNoPrimary errors
- Hostname mismatches (81dd5cf3 vs a48dcfcb)
- Container exit with non-zero code

## Migration Plan

### Option 1: Use Existing MongoDB Cluster (Recommended)

This saves costs by reusing your existing DigitalOcean Managed MongoDB.

1. **Create Droplet** (see quick-deploy.md)

2. **Modify docker-compose.yml** to use external MongoDB:
```yaml
version: '3.8'

services:
  rocketchat:
    image: rocketchat/rocket.chat:latest
    restart: unless-stopped
    environment:
      # Use your existing MongoDB cluster
      MONGO_URL: mongodb+srv://rocketchat:c2K8739L14vJ5zgW@everjust-chat-mongo-4a26eae1.mongo.ondigitalocean.com/rocketchat?tls=true&authSource=admin&replicaSet=everjust-chat-mongo
      MONGO_OPLOG_URL: mongodb+srv://rocketchat:c2K8739L14vJ5zgW@everjust-chat-mongo-4a26eae1.mongo.ondigitalocean.com/local?tls=true&authSource=admin&replicaSet=everjust-chat-mongo
      ROOT_URL: https://everjust.chat
      PORT: 3000
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads

# No mongo service needed - using external MongoDB
```

3. **Configure Firewall** in DigitalOcean MongoDB cluster to allow your Droplet IP

### Option 2: Fresh Start with Self-Hosted MongoDB

Use the standard deployment (see quick-deploy.md) which includes MongoDB in Docker.

**Advantages**:
- Complete control
- No external dependencies
- Easier troubleshooting
- Lower cost (no separate MongoDB cluster fee)

## Cleanup Steps

After successful migration:

### 1. Delete Failed App Platform Apps
```bash
# Using DigitalOcean CLI (doctl)
doctl apps delete 57a12538-5c44-416d-a0d2-7f8248a18844
doctl apps delete 1c26f0d5-3f01-4456-992d-cb5ca5fe957d
```

Or delete from DigitalOcean dashboard.

### 2. Delete or Keep MongoDB Cluster

**If using Option 2 (self-hosted MongoDB):**
```bash
# First backup if needed
doctl databases db-create-backup 189b1950-95e5-418d-bd7e-12676c94c1de

# Then delete (WARNING: This is permanent!)
doctl databases delete 189b1950-95e5-418d-bd7e-12676c94c1de
```

**If using Option 1:** Keep the MongoDB cluster and ensure firewall rules allow your Droplet.

### 3. Update DNS

Ensure DNS points to your new Droplet IP instead of App Platform.

## Cost Comparison

### Previous (App Platform + Managed MongoDB)
- App Platform: ~$40-60/month (professional-m instance)
- MongoDB Cluster: ~$15/month
- **Total**: ~$55-75/month

### New (Droplet)
- Droplet (2GB): $12/month
- Droplet (4GB): $24/month (recommended for production)
- **Total**: $12-24/month

**Savings**: $31-51/month (56-68% reduction)

## Data Migration

If you have existing data in the MongoDB cluster:

### Export from Managed MongoDB
```bash
# On your local machine or droplet
mongodump --uri="mongodb+srv://rocketchat:c2K8739L14vJ5zgW@everjust-chat-mongo-4a26eae1.mongo.ondigitalocean.com/rocketchat?tls=true&authSource=admin" --out=./backup
```

### Import to Docker MongoDB (if using Option 2)
```bash
# Copy backup to droplet
scp -r ./backup root@[droplet-ip]:/tmp/

# On droplet
cd /opt/rocketchat
docker-compose exec -T mongo mongorestore /dump/backup/rocketchat
```

## Advantages of Droplet Deployment

1. **Direct Control**: SSH access to debug issues immediately
2. **No Platform Abstractions**: Direct Docker/MongoDB access
3. **Cost Effective**: 56-68% cheaper than App Platform
4. **Proven Solution**: Community-tested approach
5. **Better Debugging**: Direct log access without platform limitations
6. **No Caching Issues**: No platform-level connection string caching

## Timeline

1. **Immediate**: Create Droplet and deploy Rocket.Chat (30 minutes)
2. **DNS Propagation**: 5-30 minutes
3. **SSL Setup**: 5 minutes
4. **Testing**: 15 minutes
5. **Cleanup**: 10 minutes

**Total Time**: ~1-2 hours

## Support Resources

- Docker logs: `docker-compose logs -f`
- MongoDB connection test: `docker-compose exec rocketchat nc -zv mongo 27017`
- Nginx logs: `/var/log/nginx/rocketchat.error.log`
- Community: https://forums.rocket.chat/
