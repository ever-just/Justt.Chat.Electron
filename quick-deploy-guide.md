# 🚀 QUICK DEPLOY: EVERJUST Chat (2 minutes)

## 📋 **IMMEDIATE DEPLOYMENT STEPS**

### **1. Create DigitalOcean Droplet**
1. Go to: **https://cloud.digitalocean.com/droplets/new**
2. Choose:
   - **Image**: Ubuntu 22.04 LTS x64
   - **Plan**: Basic → Regular Intel ($24/month)
   - **Size**: 2 vCPUs, 4GB RAM
   - **Region**: New York 1 (or closest to you)

### **2. Add Initialization Script**
1. Scroll down to **"Advanced Options"**
2. Click **"Add initialization scripts"**
3. Copy the ENTIRE content from `user-data-script.sh` file
4. Paste it in the text box

### **3. Finish Setup**
1. **Hostname**: `everjust-chat-v2`
2. **Tags**: `everjust,rocketchat,production`
3. Click **"Create Droplet"**

---

## ⏰ **WHAT HAPPENS NEXT (3-5 minutes)**

✅ **Automatic Setup**:
- Ubuntu installs and updates
- Docker + Docker Compose install
- Latest Rocket.Chat downloads and starts
- MongoDB initializes with replica set
- Nginx installs and configures
- SSL tools install (Certbot)

✅ **Email Configuration**:
- SendGrid integration ready
- Email verification enabled
- Setup wizard: **REQUIRES EMAIL CONFIGURATION**
- Need SendGrid API key for email functionality

---

## 🎯 **AFTER DEPLOYMENT**

### **1. Get Droplet IP**
- Copy the IP address from DigitalOcean dashboard

### **2. Test Access**
- Visit: `http://[YOUR-DROPLET-IP]:3000`
- Login: `admin` / `supersecret`
- ✅ **Should work immediately with NO setup wizard!**

### **3. Update DNS**
- Point `everjust.chat` to the new droplet IP
- Update A record: `chat` → `[NEW-DROPLET-IP]`

### **4. Configure SendGrid Email**
- Get SendGrid API key from: https://app.sendgrid.com/settings/api_keys
- SSH into droplet: `ssh root@[DROPLET-IP]`
- Set environment variable: `export SENDGRID_API_KEY=SG.your_api_key_here`
- Restart Rocket.Chat: `cd /opt/rocketchat && docker-compose restart rocketchat`

### **5. Configure SSL**
- Run: `certbot --nginx -d everjust.chat`
- Follow prompts to get free SSL certificate

### **6. Update Desktop App**
- Edit `servers.json`: Update to new IP or domain
- Restart desktop app
- ✅ **Desktop app will work with latest Rocket.Chat!**

---

## 📊 **FINAL CONFIGURATION**

- **Server**: Latest Rocket.Chat (7.x series)
- **Admin**: admin / supersecret
- **Domain**: everjust.chat
- **Cost**: $24/month
- **Setup Time**: 5 minutes total
- **Version Compatibility**: ✅ Works with desktop app

---

## 🆘 **IF SOMETHING GOES WRONG**

1. **SSH into droplet**: `ssh root@[DROPLET-IP]`
2. **Check deployment logs**: `cat /opt/rocketchat/deployment-complete.log`
3. **Check Docker status**: `cd /opt/rocketchat && docker-compose ps`
4. **View logs**: `docker-compose logs rocketchat`

---

## ✅ **SUCCESS INDICATORS**

- ✅ Droplet creates successfully
- ✅ `http://[IP]:3000` shows Rocket.Chat login (NO setup wizard)
- ✅ Login with admin/supersecret works immediately
- ✅ Desktop app connects without version errors

**🎉 Your EVERJUST Chat is ready!**
