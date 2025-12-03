# Screen Share App API Documentation

## Overview

The Screen Share App provides real-time screen sharing capabilities through a combination of REST API endpoints and WebSocket (Socket.IO) events. The application supports two main user roles: **Host** (screen sharer) and **Viewer** (screen viewer).

## Architecture

- **Frontend**: React application with TypeScript, Vite, and Tailwind CSS
- **Backend**: Node.js/Express server with Socket.IO for real-time communication
- **Communication**: WebRTC for peer-to-peer screen sharing, Socket.IO for signaling
- **Containerization**: Docker with multi-stage builds for production deployment

## REST API Endpoints

### Health Check

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

## Socket.IO Events

All real-time communication happens through Socket.IO events. The server manages rooms where hosts share screens and viewers join to watch.

### Connection Management

#### Connection Event
- **Event**: `connection`
- **Description**: Fired when a client connects to the server
- **Server Response**: Assigns a unique user ID to the socket

#### Disconnection Event
- **Event**: `disconnect`
- **Description**: Fired when a client disconnects
- **Behavior**: Cleans up user sessions and notifies other room members

### Room Management

#### Create Room (Host)
- **Event**: `create-room`
- **Direction**: Client → Server
- **Description**: Creates a new screen sharing room
- **Data**: None required
- **Server Response**:
  ```json
  {
    "roomCode": "ABC123",
    "success": true
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Failed to create room"
  }
  ```

#### Join Room (Viewer)
- **Event**: `join-room`
- **Direction**: Client → Server
- **Description**: Joins an existing screen sharing room
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
- **Server Broadcast**: `viewer-joined` to all room members
  ```json
  {
    "viewerId": "user_1234567890_abc123def",
    "viewerCount": 5
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Room not found"
  }
  ```

#### Leave Room
- **Event**: `leave-room`
- **Direction**: Client → Server
- **Description**: Leaves the current room
- **Data**:
  ```json
  {
    "roomCode": "ABC123"
  }
  ```
- **Server Response**:
  ```json
  {
    "success": true
  }
  ```
- **Server Broadcast**: `viewer-left` to remaining room members
  ```json
  {
    "viewerId": "user_1234567890_abc123def",
    "viewerCount": 4
  }
  ```

### WebRTC Signaling

#### WebRTC Offer
- **Event**: `webrtc-offer`
- **Direction**: Host → Server → Viewers
- **Description**: Sends WebRTC offer from host to viewers
- **Data**:
  ```json
  {
    "offer": {
      "type": "offer",
      "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1..."
    }
  }
  ```

#### WebRTC Answer
- **Event**: `webrtc-answer`
- **Direction**: Viewer → Server → Host
- **Description**: Sends WebRTC answer from viewer to host
- **Data**:
  ```json
  {
    "answer": {
      "type": "answer",
      "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1..."
    }
  }
  ```

#### ICE Candidate
- **Event**: `ice-candidate`
- **Direction**: Bidirectional
- **Description**: Exchanges ICE candidates for WebRTC connection establishment
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

## Data Types

### Room Code
- **Format**: 6-character alphanumeric string (uppercase)
- **Example**: `"ABC123"`
- **Validation**: Must match `/^[A-Z0-9]{6}$/`

### User ID
- **Format**: Auto-generated unique identifier
- **Example**: `"user_1704067200000_abc123def"`
- **Structure**: `user_{timestamp}_{random_string}`

## Error Handling

All socket events include error handling with appropriate error messages:

- `"Invalid room code"`
- `"Room not found"`
- `"Failed to create room"`
- `"Failed to join room"`
- `"Failed to leave room"`

## Security Considerations

- Room codes are validated server-side
- User IDs are generated server-side to prevent spoofing
- WebRTC connections are peer-to-peer (not relayed through server)
- CORS is configured for cross-origin requests
- Helmet.js provides security headers

## Development

### Environment Variables
- `NODE_ENV`: Environment mode (`development` or `production`)
- `PORT`: Server port (default: 3001)

### Running Locally
```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Start development servers
npm run dev  # Root level starts both client and server
```

### Building for Production
```bash
# Build client
cd client && npm run build

# Build server
cd ../server && npm run build

# Start production server
cd server && npm start
```

## Deployment

The application includes Docker configuration for containerized deployment:

```bash
# Build and run with Docker Compose
docker-compose up --build
```

This starts the application with optional Redis for session storage and Nginx for production proxying.
