# Screen Share App Deployment Guide

## Overview

This guide covers deploying the Screen Share App to various environments including local development, Docker containers, and cloud platforms.

## Prerequisites

- Node.js 18+ (for local development)
- Docker and Docker Compose (for containerized deployment)
- Git (for version control)

## Local Development

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd screen-share-app
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```

   This starts:
   - Client at http://localhost:3000
   - Server at http://localhost:3001

### Manual Setup

If you prefer to run services separately:

```bash
# Terminal 1: Start the server
cd server
npm install
npm run dev

# Terminal 2: Start the client
cd client
npm install
npm run dev
```

## Docker Deployment

### Using Docker Compose (Recommended)

The application includes a complete Docker Compose setup for production deployment.

#### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

#### Quick Deployment

1. **Clone and navigate**:
   ```bash
   git clone <repository-url>
   cd screen-share-app
   ```

2. **Environment setup** (optional):
   ```bash
   cp .env.example .env
   # Edit .env with your production settings
   ```

3. **Deploy**:
   ```bash
   docker-compose up -d --build
   ```

4. **Access the application**:
   - Client: http://localhost:3000
   - Server: http://localhost:3001

#### Docker Compose Services

The `docker-compose.yml` includes:

- **client**: React frontend served by Nginx
- **server**: Node.js backend with Express and Socket.IO
- **nginx** (optional): Reverse proxy for production

### Manual Docker Build

#### Build Client Image

```bash
cd client
docker build -f ../Dockerfile.client -t screen-share-client .
```

#### Build Server Image

```bash
cd server
docker build -f ../Dockerfile.server -t screen-share-server .
```

#### Run Containers

```bash
# Run server
docker run -d \
  --name screen-share-server \
  -p 3001:3001 \
  -e NODE_ENV=production \
  screen-share-server

# Run client
docker run -d \
  --name screen-share-client \
  -p 3000:80 \
  screen-share-client
```

## Production Deployment

### Node.js Deployment

#### Build Process

1. **Build the client**:
   ```bash
   cd client
   npm run build
   ```

2. **Build the server** (if using TypeScript):
   ```bash
   cd server
   npm run build
   ```

3. **Configure environment**:
   ```bash
   # Create production .env
   NODE_ENV=production
   PORT=3001
   CLIENT_URL=https://yourdomain.com
   LOG_LEVEL=warn
   ```

#### Process Management with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
cd server
pm2 start dist/server.js --name "screen-share"

# Configure PM2 to start on boot
pm2 startup
pm2 save

# View logs
pm2 logs screen-share

# Monitor processes
pm2 monit
```

### Nginx Reverse Proxy

#### Basic Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Client application
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API and WebSocket
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### SSL Configuration with Let's Encrypt

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Certbot will automatically update nginx config
```

### SSL/TLS Setup

#### Manual SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # ... rest of config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Cloud Deployment

### Vercel (Client Only)

Deploy the React client to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy client
cd client
vercel --prod
```

### Railway

1. **Connect repository**:
   - Link your GitHub repository to Railway
   - Railway auto-detects the Node.js application

2. **Environment variables**:
   ```
   NODE_ENV=production
   PORT=3001
   CLIENT_URL=https://your-app.railway.app
   ```

3. **Deploy**: Automatic on git push

### Heroku

1. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

2. **Configure environment**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set CLIENT_URL=https://your-app.herokuapp.com
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

### AWS EC2

#### Basic EC2 Setup

1. **Launch EC2 instance**:
   - Ubuntu 20.04 LTS
   - t2.micro or t3.small for development
   - Security group: ports 22, 80, 443

2. **Install dependencies**:
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx git
   ```

3. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd screen-share-app
   npm run install:all
   ```

4. **Configure nginx** (see nginx section above)

5. **Start services**:
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

### DigitalOcean App Platform

1. **Create app** from GitHub repository
2. **Configure services**:
   - Static site for client
   - Web service for server
3. **Environment variables** in app settings
4. **Deploy**: Automatic on push

## Environment Variables

### Required Variables

```env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://yourdomain.com
```

### Optional Variables

```env
LOG_LEVEL=info
SESSION_TIMEOUT=3600000
ROOM_CLEANUP_INTERVAL=300000
MAX_ROOM_SIZE=50
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## Monitoring and Maintenance

### Health Checks

The application includes health check endpoints:

- `GET /health` - Server health status
- Socket.IO connection monitoring

### Logging

#### Log Locations
- Server logs: `server/logs/`
- PM2 logs: `~/.pm2/logs/`
- Nginx logs: `/var/log/nginx/`

#### Log Rotation
```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Backup Strategy

For production deployments with persistent data:

```bash
# Database backup (if applicable)
mysqldump -u user -p database > backup.sql

# Configuration backup
cp .env .env.backup

# Log archival
tar -czf logs-$(date +%Y%m%d).tar.gz server/logs/
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### WebSocket Connection Issues
- Check firewall settings
- Verify nginx WebSocket proxy configuration
- Ensure SSL certificates are valid

#### Memory Issues
```bash
# Monitor memory usage
pm2 monit

# Restart services
pm2 restart all
```

#### SSL Certificate Renewal
```bash
# Renew Let's Encrypt certificates
sudo certbot renew

# Reload nginx
sudo nginx -s reload
```

## Performance Optimization

### Server Optimization

```bash
# Enable gzip compression
# Add to nginx config:
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization (Future)

When database is added:
- Connection pooling
- Query optimization
- Indexing strategy
- Read replicas

## Security Checklist

- [ ] HTTPS enabled
- [ ] SSL certificates valid
- [ ] Firewall configured
- [ ] Security headers enabled
- [ ] Input validation active
- [ ] Rate limiting configured
- [ ] Logs monitored
- [ ] Backups scheduled
- [ ] Dependencies updated

## Scaling

### Horizontal Scaling

```bash
# PM2 clustering
pm2 start app.js -i max

# Load balancer configuration
upstream backend {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

# Nginx load balancing
location / {
    proxy_pass http://backend;
}
```

### Vertical Scaling

- Increase EC2 instance size
- Add more memory/CPU
- Optimize application code
- Implement caching layers

## Backup and Recovery

### Automated Backups

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/screen-share-app

# Backup database (future)
mysqldump -u user -p database > $BACKUP_DIR/db_$DATE.sql

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### Recovery Process

1. **Stop services**:
   ```bash
   pm2 stop all
   ```

2. **Restore backup**:
   ```bash
   cd /opt
   tar -xzf /opt/backups/app_latest.tar.gz
   ```

3. **Restore database** (if applicable):
   ```bash
   mysql -u user -p database < /opt/backups/db_latest.sql
   ```

4. **Restart services**:
   ```bash
   pm2 restart all
   ```

This deployment guide provides comprehensive instructions for deploying the Screen Share App in various environments, from local development to production cloud deployments.
