# Screen Share App

A professional web-based screen sharing application built with React, TypeScript, Node.js, and Socket.IO. Features real-time screen sharing with WebRTC and fallback to Socket.IO streaming.

## Features

- **Real-time Screen Sharing**: Share your screen with viewers instantly
- **WebRTC Primary**: Direct peer-to-peer connection for optimal performance
- **Socket.IO Fallback**: Canvas-based streaming when WebRTC is unavailable
- **Secure Rooms**: 6-digit alphanumeric room codes for access control
- **Responsive Design**: Works on desktop and mobile devices
- **No Database**: In-memory session management for simplicity
- **Auto Cleanup**: Automatic cleanup of inactive sessions and rooms

## Tech Stack

### Frontend
- React 18 with TypeScript
- TailwindCSS for styling
- Vite for build tooling
- Socket.IO client for real-time communication
- Lucide React for icons

### Backend
- Node.js with Express
- TypeScript
- Socket.IO for WebSocket communication
- Winston for logging
- Helmet for security
- CORS for cross-origin requests

## Architecture

### System Overview

The Screen Share App follows a client-server architecture with real-time communication capabilities:

```
┌─────────────────┐    WebSocket/Socket.IO    ┌─────────────────┐
│   React Client  │◄────────────────────────►│  Node.js Server │
│                 │                           │                 │
│ • Host Interface│                           │ • Session Mgmt  │
│ • Viewer Interface│◄──────────────────────►│ • Room Service   │
│ • WebRTC Peer   │    WebRTC (P2P)          │ • Socket Handler │
│ • Screen Capture│                           │ • Health Checks  │
└─────────────────┘                           └─────────────────┘
```

### Client Architecture

The React frontend is organized into modular components:

- **Components**: Reusable UI components (Button, Modal, etc.)
- **Hooks**: Custom React hooks for state management and side effects
- **Services**: API calls and WebRTC/Socket.IO communication
- **Utils**: Helper functions and utilities
- **Types**: TypeScript type definitions

### Server Architecture

The Node.js backend uses Express with middleware architecture:

- **Controllers**: Handle HTTP requests (health checks)
- **Services**: Business logic (session and room management)
- **Middleware**: CORS, security, error handling, logging
- **Utils**: Shared utilities (code generation, validation)
- **Types**: TypeScript interfaces and types

### Communication Flow

1. **Room Creation**: Host creates room → Server generates unique code → Code shared with viewers
2. **Connection Establishment**:
   - Viewer joins room → Server validates code → Room state updated
   - WebRTC signaling via Socket.IO for P2P connection
   - Fallback to Socket.IO streaming if WebRTC fails
3. **Screen Sharing**: Host captures screen → Streams via WebRTC/Socket.IO → Viewers receive and display
4. **Session Management**: Automatic cleanup of inactive sessions and rooms

### Data Flow

```
Host Action → Client Hook → Socket Event → Server Handler → Service Logic → Database Update → Socket Broadcast → Client Update
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd screen-share-app
```

2. Install dependencies:
```bash
npm run install:all
```

3. Start development servers:
```bash
npm run dev
```

This will start both the client (http://localhost:3000) and server (http://localhost:3001).

### Production Build

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Usage

### As a Host
1. Open the application in your browser
2. Click "Start Sharing"
3. Allow screen capture permissions
4. Share the generated 6-digit room code with viewers

### As a Viewer
1. Open the application in your browser
2. Click "Join Session"
3. Enter the room code provided by the host
4. Click "Connect to Room"

## API Documentation

### Server Endpoints

- `GET /health` - Health check endpoint
- `WebSocket` - Real-time communication via Socket.IO

### Socket Events

#### Host Events
- `create-room` - Create a new sharing session
- `webrtc-offer` - Send WebRTC offer to viewers
- `webrtc-answer` - Receive WebRTC answer from viewers
- `ice-candidate` - Exchange ICE candidates

#### Viewer Events
- `join-room` - Join an existing sharing session
- `leave-room` - Leave the current session
- `webrtc-offer` - Receive WebRTC offer from host
- `webrtc-answer` - Send WebRTC answer to host
- `ice-candidate` - Exchange ICE candidates

## Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
LOG_LEVEL=info
```

### Client Configuration

The client automatically connects to the server. To change the server URL, modify `client/src/services/socket.ts`.

## Deployment

### Docker Deployment

The application includes Docker support for easy deployment:

#### Using Docker Compose (Recommended)

1. **Prerequisites**:
   - Docker and Docker Compose installed
   - Ports 3000 and 3001 available

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your production settings
   ```

3. **Deploy**:
   ```bash
   docker-compose up -d
   ```

4. **Access**:
   - Client: http://localhost:3000
   - Server: http://localhost:3001

#### Manual Docker Build

```bash
# Build client
docker build -f Dockerfile.client -t screen-share-client .

# Build server
docker build -f Dockerfile.server -t screen-share-server .

# Run containers
docker run -d -p 3000:3000 screen-share-client
docker run -d -p 3001:3001 -e NODE_ENV=production screen-share-server
```

### Production Server Setup

#### Node.js Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Environment Configuration**:
   ```bash
   # Create production .env
   NODE_ENV=production
   PORT=3001
   CLIENT_URL=https://yourdomain.com
   LOG_LEVEL=warn
   ```

3. **Process Management**:
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start dist/server/server.js --name "screen-share"
   pm2 startup
   pm2 save
   ```

4. **Reverse Proxy (nginx)**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       # Client
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       # Server API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       # WebSocket
       location /socket.io {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

#### Cloud Deployment

##### Vercel (Client Only)
```bash
npm install -g vercel
cd client
vercel --prod
```

##### Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

##### Heroku
```bash
# Create heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set CLIENT_URL=https://your-app.herokuapp.com

# Deploy
git push heroku main
```

### SSL/TLS Setup

#### Let's Encrypt (Free SSL)
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx to use SSL
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... rest of config
}
```

#### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://yourdomain.com
LOG_LEVEL=warn
SESSION_TIMEOUT=3600000
ROOM_CLEANUP_INTERVAL=300000
MAX_ROOM_SIZE=50
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Monitoring and Logging

#### Health Checks
- Endpoint: `GET /health`
- Returns server status and metrics

#### Log Management
- Logs stored in `server/logs/`
- Winston logger with multiple transports
- Log rotation and compression

#### Performance Monitoring
- Built-in metrics collection
- WebRTC connection monitoring
- Room activity tracking

## Development

### Project Structure

```
screen-share-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API and socket services
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Global styles
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Request controllers
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── middleware/    # Express middleware
├── shared/                 # Shared types and utilities
└── scripts/                # Build and deployment scripts
```

### Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client
- `npm run dev:server` - Start only the server
- `npm run build` - Build both client and server for production
- `npm run lint` - Run ESLint on both client and server
- `npm run test` - Run tests (when implemented)

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Security

- HTTPS recommended for production
- CORS configured for allowed origins
- Helmet for security headers
- Input validation and sanitization
- Rate limiting (basic implementation)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting: `npm run lint`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the repository.
