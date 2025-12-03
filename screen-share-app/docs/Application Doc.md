# Screen Share App - Complete Application Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Documentation](#api-documentation)
4. [Deployment Guide](#deployment-guide)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Contributing Guidelines](#contributing-guidelines)

---

## Overview

The Screen Share App is a real-time screen sharing application built with modern web technologies. It enables users to share their screens securely through web browsers without requiring downloads or installations.

### Key Features

- **Real-time Screen Sharing**: WebRTC-based peer-to-peer screen sharing
- **Room-based Access**: Secure room codes for controlled access
- **Cross-platform**: Works on desktop and mobile browsers
- **No Installation Required**: Pure web-based solution
- **Scalable Architecture**: Supports multiple concurrent sessions

### Technology Stack

#### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time communication
- **WebRTC** for peer-to-peer media streaming

#### Backend
- **Node.js** with Express.js
- **Socket.IO** for real-time bidirectional communication
- **Winston** for logging
- **Helmet** for security headers
- **CORS** for cross-origin resource sharing

#### DevOps
- **Docker** for containerization
- **Docker Compose** for multi-service orchestration
- **GitHub Actions** for CI/CD

---

## Architecture

### High-Level Architecture

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

### Client-Side Architecture

#### Core Components
- **App.tsx**: Main application component with routing logic
- **HostController.tsx**: Manages screen sharing session for hosts
- **ViewerController.tsx**: Handles viewer connections and screen display
- **ScreenCapture.tsx**: WebRTC screen capture functionality
- **ScreenViewer.tsx**: Displays shared screens using WebRTC streams

#### Common Components
- **Button.tsx**: Reusable button component
- **Modal.tsx**: Modal dialog component
- **Input.tsx**: Form input component
- **Loader.tsx**: Loading indicator component

#### Layout Components
- **Header.tsx**: Application header
- **Footer.tsx**: Application footer
- **ConnectionStatus.tsx**: Real-time connection status indicator

#### Services & Hooks
- **useSocket.ts**: Socket.IO connection management
- **usePeerConnection.ts**: WebRTC peer connection handling
- **useScreenCapture.ts**: Screen capture state management
- **webrtc.ts**: WebRTC signaling and peer management
- **screenCapture.ts**: Screen capture utilities

### Server-Side Architecture

#### Core Files
- **app.ts**: Express application setup with middleware
- **server.ts**: HTTP server initialization
- **socket.ts**: Socket.IO event handlers

#### Controllers
- **health.controller.ts**: Health check endpoints

#### Services
- **session.service.ts**: User session management
- **room.service.ts**: Room creation and management

#### Middleware
- **cors.middleware.ts**: Cross-origin resource sharing
- **errorHandler.ts**: Global error handling

### Communication Flow

#### Room Creation Flow
1. Host initiates sharing
2. Client sends `create-room` event
3. Server generates unique room code
4. Server creates room and host session
5. Server responds with room code

#### WebRTC Connection Flow
1. Host captures screen via `getDisplayMedia()`
2. Host creates WebRTC peer connection
3. Host sends offer via Socket.IO
4. Viewer receives offer and creates answer
5. ICE candidates exchanged
6. Peer-to-peer connection established

### Security Architecture

- **Room-based access control**: 6-digit alphanumeric codes
- **Session management**: Server-side session tracking
- **Input validation**: Client and server-side validation
- **CORS protection**: Configured allowed origins
- **WebRTC encryption**: DTLS encryption by default

---

## API Documentation

### REST API Endpoints

#### GET /health

Returns the health status of the server.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

### Socket.IO Events

#### Connection Management

**Connection Event**
- **Event**: `connection`
- **Description**: Fired when a client connects to the server
- **Server Response**: Assigns a unique user ID to the socket

**Disconnection Event**
- **Event**: `disconnect`
- **Description**: Fired when a client disconnects
- **Behavior**: Cleans up user sessions and notifies other room members

#### Room Management

**Create Room (Host)**
- **Event**: `create-room`
- **Direction**: Client → Server
- **Data**: None required
- **Server Response**:
  ```json
  {
    "roomCode": "ABC123",
    "success": true
  }
  ```

**Join Room (Viewer)**
- **Event**: `join-room`
- **Direction**: Client → Server
- **Data**:
  ```json
  {
    "roomCode": "ABC123"
  }
  ```
- **Server Response** (Success):
  ```json
  {
    "roomCode": "ABC123",
    "success": true,
    "viewerCount": 5
  }
  ```

**Leave Room**
- **Event**: `leave-room`
- **Direction**: Client → Server
- **Data**:
  ```json
  {
    "roomCode": "ABC123"
  }
  ```

#### WebRTC Signaling

**WebRTC Offer**
- **Event**: `webrtc-offer`
- **Direction**: Host → Server → Viewers
- **Data**:
  ```json
  {
    "offer": {
      "type": "offer",
      "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1..."
    }
  }
  ```

**WebRTC Answer**
- **Event**: `webrtc-answer`
- **Direction**: Viewer → Server → Host
- **Data**:
  ```json
  {
    "answer": {
      "type": "answer",
      "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1..."
    }
  }
  ```

**ICE Candidate**
- **Event**: `ice-candidate`
- **Direction**: Bidirectional
- **Data**:
  ```json
  {
    "candidate": {
      "candidate": "candidate:1 1 UDP 2122260223 192.168.1.1 53533 typ host",
      "sdpMid": "0",
      "sdpMLineIndex": 0
    }
  }
  ```

### Data Types

- **Room Code**: 6-character alphanumeric string (uppercase)
- **User ID**: Auto-generated unique identifier
- **WebRTC SDP**: Session Description Protocol data

---

## Deployment Guide

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

### Local Development

#### Quick Start

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

### Docker Deployment

#### Using Docker Compose (Recommended)

1. **Clone and navigate**:
   ```bash
   git clone <repository-url>
   cd screen-share-app
   ```

2. **Deploy**:
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**:
   - Client: http://localhost:3000
   - Server: http://localhost:3001

### Production Deployment

#### Node.js Deployment

1. **Build the client**:
   ```bash
   cd client
   npm run build
   ```

2. **Configure environment**:
   ```bash
   NODE_ENV=production
   PORT=3001
   CLIENT_URL=https://yourdomain.com
   ```

3. **Start with PM2**:
   ```bash
   npm install -g pm2
   pm2 start server/dist/server.js --name "screen-share"
   pm2 startup
   pm2 save
   ```

#### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Cloud Deployment Options

- **Vercel**: For client-only deployment
- **Railway**: Full-stack deployment
- **Heroku**: Traditional PaaS deployment
- **AWS EC2**: Custom server deployment
- **DigitalOcean App Platform**: Managed deployment

### Environment Variables

```env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://yourdomain.com
LOG_LEVEL=info
```

---

## Troubleshooting Guide

### Installation Issues

#### npm install fails
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Permission errors on Linux/Mac
```bash
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Development Server Issues

#### Port already in use
```bash
lsof -i :3000
lsof -i :3001
kill -9 <PID>
```

#### CORS errors
- Check `server/src/middleware/cors.middleware.ts`
- Ensure `CLIENT_URL` environment variable is set

### Screen Sharing Issues

#### Screen capture doesn't work
- Check browser support (Chrome 72+, Firefox 66+, Safari 13+)
- Grant screen sharing permissions when prompted
- Update browser to latest version

#### Screen capture shows black screen
- Select "Entire Screen" instead of "Window"
- Try different screen if multiple monitors
- Check system permissions (macOS: Screen Recording)

### Connection Issues

#### Cannot connect to room
- Verify room code (6 uppercase alphanumeric characters)
- Ensure room exists and host is active
- Check network connectivity

#### Connection drops frequently
- Test with different network
- Disable VPN temporarily
- Check firewall settings

### WebRTC Issues

#### WebRTC connection fails
- Verify ICE server configuration
- Check for symmetric NAT
- Ensure UDP ports are open

#### Audio/Video quality issues
- Check internet speed (minimum 1 Mbps upload)
- Close bandwidth-intensive applications
- Enable hardware acceleration in browser

### Browser Compatibility

#### Chrome/Chromium issues
- Update to latest version
- Try incognito mode
- Disable extensions temporarily

#### Firefox issues
- Set `media.peerconnection.enabled` to `true`
- Enable `media.getusermedia.screensharing.enabled`

#### Safari issues
- macOS 10.14+ and Safari 12+
- Enable camera and microphone permissions

### Build and Deployment Issues

#### Build fails
```bash
rm -rf client/dist server/dist
npm run build
```

#### Docker build fails
```bash
docker system prune -a
docker-compose up --build
```

#### Production issues
- Verify all environment variables are set
- Check SSL certificates are valid
- Ensure nginx configuration is correct

### Getting Help

If issues persist:
1. Check server logs: `tail -f server/logs/error.log`
2. Gather browser console errors
3. Test with different browsers and networks
4. Create an issue on GitHub with detailed information

---

## Contributing Guidelines

### Code of Conduct

#### Our Standards
- Be respectful and inclusive
- Show empathy towards other community members
- Focus on constructive feedback
- Accept responsibility for mistakes

#### Unacceptable Behavior
- Harassment or discriminatory language
- Publishing private information without consent
- Trolling or inflammatory comments
- Any other conduct that could reasonably be considered inappropriate

### Getting Started

#### Prerequisites
- Node.js 18+
- Git
- VS Code with TypeScript and React extensions
- Basic knowledge of React, TypeScript, and Node.js

#### Setup
1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/screen-share-app.git
   cd screen-share-app
   ```
3. **Install dependencies**:
   ```bash
   npm run install:all
   ```
4. **Start development servers**:
   ```bash
   npm run dev
   ```

#### Verify Setup
- Client: http://localhost:3000
- Server: http://localhost:3001

### Development Workflow

#### Branch Naming
- `feature/description-of-feature` - New features
- `fix/description-of-bug` - Bug fixes
- `docs/description-of-docs` - Documentation updates
- `refactor/description-of-refactor` - Code refactoring

#### Creating a Feature Branch
```bash
git checkout -b feature/your-feature-name
git push -u origin feature/your-feature-name
```

### Commit Guidelines

#### Conventional Commits
```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

#### Examples
```
feat: add screen recording functionality
fix: resolve WebRTC connection issues in Firefox
docs: update API documentation for socket events
```

### Coding Standards

#### TypeScript Guidelines
- Use strict mode
- Explicit type annotations for function parameters
- Avoid `any` type when possible
- Use interfaces for object shapes

#### React Best Practices
- Use functional components with hooks
- Custom hooks for shared logic
- Proper dependency arrays in useEffect
- Error boundaries for error handling

#### Code Style
- ESLint configuration enforced
- Prettier for consistent formatting
- Meaningful variable and function names
- Single responsibility principle

### Pull Request Process

1. **Ensure your branch is up to date**:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run tests and linting**:
   ```bash
   npm run lint
   npm run build
   ```

3. **Create a pull request**:
   - Use descriptive title and description
   - Reference related issues
   - Include screenshots for UI changes

4. **Address review feedback**:
   - Make requested changes
   - Update documentation if needed
   - Rebase and squash commits if requested

### Testing

#### Running Tests
```bash
npm test
```

#### Writing Tests
- Unit tests for utilities and hooks
- Integration tests for components
- E2E tests for critical user flows

### Documentation

#### Code Documentation
- JSDoc comments for functions and classes
- README updates for new features
- Inline comments for complex logic

#### API Documentation
- Update API docs for new endpoints
- Document breaking changes
- Include examples and error responses

### Issue Reporting

#### Bug Reports
- Use the bug report template
- Include steps to reproduce
- Provide browser and OS information
- Attach screenshots or videos

#### Feature Requests
- Use the feature request template
- Describe the problem and solution
- Include mockups if applicable
- Consider alternative solutions

### Community

#### Communication
- Be respectful and constructive
- Use inclusive language
- Help others when possible
- Share knowledge and best practices

#### Recognition
Contributors are recognized through:
- GitHub contributor statistics
- Mention in release notes
- Community acknowledgments

### License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## Quick Start Guide

### For Users

1. **Access the application** at the deployed URL
2. **Choose your role**:
   - **Host**: Click "Start Sharing" to create a room
   - **Viewer**: Enter the room code shared by the host
3. **Grant permissions** when prompted for screen sharing
4. **Enjoy real-time screen sharing**!

### For Developers

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd screen-share-app
   npm run install:all
   npm run dev
   ```

2. **Open** http://localhost:3000 in your browser

3. **Start developing** - the application supports hot reloading

### For Deployment

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Deploy with Docker**:
   ```bash
   docker-compose up -d --build
   ```

3. **Access** your deployed application

---

## Support

- **Documentation**: Check this comprehensive guide
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and community support
- **Contributing**: See the contributing guidelines above

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*This documentation is automatically generated and maintained. Last updated: December 2024*
