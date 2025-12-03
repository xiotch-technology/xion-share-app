# Screen Share App Architecture

## Overview

The Screen Share App is a real-time screen sharing application built with modern web technologies. It enables users to share their screens securely through web browsers without requiring downloads or installations.

## High-Level Architecture

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

## Client-Side Architecture

### React Frontend Structure

The client application follows a modular component architecture:

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

#### Utilities
- **codeGenerator.ts**: Room code generation and validation
- **validators.ts**: Input validation utilities
- **helpers.ts**: General helper functions
- **cn.ts**: CSS class name utilities

## Server-Side Architecture

### Node.js Backend Structure

The server uses Express.js with middleware architecture:

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

#### Utilities
- **codeGenerator.ts**: Unique code generation
- **validators.ts**: Input validation
- **logger.ts**: Winston-based logging

## Communication Flow

### Room Creation Flow

1. **Host initiates sharing**:
   - Client sends `create-room` event
   - Server generates unique room code
   - Server creates room and host session
   - Server responds with room code

2. **Viewer joins room**:
   - Client sends `join-room` with room code
   - Server validates room code
   - Server creates viewer session
   - Server broadcasts viewer join to room members

### WebRTC Connection Flow

1. **Signaling setup**:
   - Host captures screen via `getDisplayMedia()`
   - Host creates WebRTC peer connection
   - Host sends offer via Socket.IO

2. **Peer connection**:
   - Viewer receives offer
   - Viewer creates answer
   - ICE candidates exchanged
   - Peer-to-peer connection established

3. **Screen streaming**:
   - Host streams screen via WebRTC
   - Viewer receives and displays stream

## Data Flow

### Application State Flow

```
User Action → Component Event → Hook Update → Socket Event → Server Handler → Service Logic → Database Update → Socket Broadcast → Client Update
```

### WebRTC Data Flow

```
Screen Capture → MediaStream → RTCPeerConnection → DataChannel/Socket.IO → Remote Peer → Video Element
```

## Security Architecture

### Authentication & Authorization

- **Room-based access control**: 6-digit alphanumeric codes
- **Session management**: Server-side session tracking
- **Input validation**: Client and server-side validation
- **CORS protection**: Configured allowed origins

### WebRTC Security

- **Peer-to-peer encryption**: DTLS encryption by default
- **Secure signaling**: All signaling through secure WebSocket
- **Origin validation**: CORS and origin checking

### Network Security

- **HTTPS enforcement**: SSL/TLS for production
- **Helmet.js**: Security headers
- **Rate limiting**: Basic request rate limiting
- **Input sanitization**: XSS prevention

## Scalability Considerations

### Horizontal Scaling

- **Stateless design**: No server-side session storage
- **Socket.IO clustering**: Multiple server instances
- **Load balancing**: Nginx upstream configuration

### Performance Optimization

- **WebRTC optimization**: Direct peer connections
- **Bundle optimization**: Code splitting and lazy loading
- **Caching strategy**: Static asset caching
- **Compression**: Gzip compression for responses

## Deployment Architecture

### Development Environment

```
┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │
│ localhost:3000 │    │ localhost:3001 │
└─────────────┘    └─────────────┘
```

### Production Environment

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Nginx     │    │   Node.js   │    │  Database  │
│   (SSL)     │◄──►│   Server    │◄──►│  (Future)  │
│             │    │             │    │            │
│ Client App  │    │ Socket.IO   │    │            │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Docker Architecture

```
┌─────────────────┐
│   Docker Host   │
├─────────────────┤
│ client (nginx)  │
│ server (node)   │
│ database (opt)  │
└─────────────────┘
```

## Technology Stack

### Frontend Technologies
- **React 18**: UI framework with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.IO Client**: Real-time communication
- **WebRTC**: Peer-to-peer media streaming

### Backend Technologies
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **Socket.IO**: Real-time bidirectional communication
- **Winston**: Logging framework
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Docker**: Containerization
- **GitHub Actions**: CI/CD

## Future Architecture Considerations

### Database Integration

When persistent data storage is needed:

```
┌─────────────┐    ┌─────────────┐
│ Application │    │  Database  │
│   Server    │◄──►│  (Redis/   │
│             │    │   MongoDB) │
└─────────────┘    └─────────────┘
```

### Microservices Architecture

For larger scale deployments:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Gateway   │    │   Room     │    │  Session   │
│   Service   │◄──►│  Service   │    │  Service   │
├─────────────┤    ├─────────────┤    ├─────────────┤
│   Client    │    │   Server    │    │   Server    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### CDN Integration

For global content delivery:

```
┌─────────────┐    ┌─────────────┐
│   Client    │    │     CDN     │
│   Assets    │◄──►│  (CloudFlare│
│             │    │   Fastly)   │
└─────────────┘    └─────────────┘
```

This architecture provides a solid foundation for real-time screen sharing while maintaining scalability, security, and maintainability.
