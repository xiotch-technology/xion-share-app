# Troubleshooting Guide

This guide helps you resolve common issues with the Screen Share App. If you can't find a solution here, please check the [GitHub Issues](https://github.com/your-repo/screen-share-app/issues) or create a new issue.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Development Server Issues](#development-server-issues)
- [Screen Sharing Issues](#screen-sharing-issues)
- [Connection Issues](#connection-issues)
- [WebRTC Issues](#webrtc-issues)
- [Browser Compatibility](#browser-compatibility)
- [Performance Issues](#performance-issues)
- [Build and Deployment Issues](#build-and-deployment-issues)

## Installation Issues

### npm install fails

**Symptoms:**
- `npm install` or `npm run install:all` fails
- Permission errors or network issues

**Solutions:**

1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node.js version**:
   ```bash
   node --version
   # Should be 18+ for this project
   ```

4. **Use different registry** (if network issues):
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

### Permission errors on Linux/Mac

**Symptoms:**
- `EACCES` permission denied errors

**Solutions:**

1. **Don't use sudo with npm**:
   ```bash
   # Instead of: sudo npm install
   npm install
   ```

2. **Fix npm permissions**:
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   ```

## Development Server Issues

### Port already in use

**Symptoms:**
- `Error: listen EADDRINUSE: address already in use`

**Solutions:**

1. **Kill process using the port**:
   ```bash
   # Find process
   lsof -i :3000
   lsof -i :3001

   # Kill process (replace PID)
   kill -9 <PID>
   ```

2. **Change port in configuration**:
   - Client: Edit `client/vite.config.ts`
   - Server: Set `PORT` environment variable

### CORS errors in development

**Symptoms:**
- Browser console shows CORS errors
- API calls fail with CORS policy errors

**Solutions:**

1. **Check server CORS configuration**:
   - Verify `server/src/middleware/cors.middleware.ts`
   - Ensure `CLIENT_URL` environment variable is set correctly

2. **Restart development servers**:
   ```bash
   npm run dev
   ```

## Screen Sharing Issues

### Screen capture doesn't work

**Symptoms:**
- "Screen sharing not supported" error
- getDisplayMedia() fails

**Solutions:**

1. **Check browser support**:
   - Chrome 72+, Firefox 66+, Safari 13+, Edge 79+
   - Ensure HTTPS in production

2. **Grant permissions**:
   - Click "Allow" when browser prompts for screen sharing
   - Check browser settings for screen capture permissions

3. **Browser settings**:
   - Chrome: `chrome://settings/content/screenCapture`
   - Firefox: `about:config` → `media.getusermedia.screensharing.enabled`

### Screen capture shows black screen

**Symptoms:**
- Screen sharing starts but shows black/blank screen

**Solutions:**

1. **Select correct screen/window**:
   - Choose "Entire Screen" instead of "Window"
   - Try different screen if multiple monitors

2. **Browser-specific issues**:
   - Chrome: Try incognito mode
   - Firefox: Check `media.getusermedia.screensharing.allowed_domains`

3. **System permissions**:
   - macOS: System Preferences → Security & Privacy → Screen Recording
   - Windows: No additional permissions needed
   - Linux: Install screen capture packages

## Connection Issues

### Cannot connect to room

**Symptoms:**
- "Room not found" error
- Unable to join existing room

**Solutions:**

1. **Verify room code**:
   - Check for typos in 6-digit code
   - Ensure code is uppercase
   - Confirm host has created the room

2. **Network connectivity**:
   ```bash
   # Test server connectivity
   curl http://localhost:3001/health
   ```

3. **Firewall settings**:
   - Ensure ports 3000 and 3001 are open
   - Check corporate firewall rules

### Connection drops frequently

**Symptoms:**
- Intermittent connection loss
- WebRTC connection fails

**Solutions:**

1. **Check network stability**:
   - Test with different network
   - Check VPN interference
   - Verify firewall settings

2. **Browser extensions**:
   - Disable ad blockers temporarily
   - Check for VPN extensions

3. **Server logs**:
   ```bash
   # Check server logs
   tail -f server/logs/combined.log
   ```

## WebRTC Issues

### WebRTC connection fails

**Symptoms:**
- "Failed to establish peer connection" error
- No video/audio stream

**Solutions:**

1. **Check STUN/TURN servers**:
   - Verify ICE server configuration
   - Test with different STUN servers

2. **Firewall and NAT issues**:
   - Ensure UDP ports 3478-3481 are open
   - Check for symmetric NAT

3. **Browser WebRTC settings**:
   - Chrome: `chrome://settings/content/webRTC`
   - Enable "WebRTC IP handling policy"

### Audio/Video quality issues

**Symptoms:**
- Poor video quality
- Audio lag or distortion
- Freezing or stuttering

**Solutions:**

1. **Network bandwidth**:
   - Check internet speed (minimum 1 Mbps upload)
   - Close bandwidth-intensive applications

2. **Browser settings**:
   - Adjust video resolution in application settings
   - Enable hardware acceleration

3. **System resources**:
   - Close unnecessary applications
   - Check CPU and memory usage

## Browser Compatibility

### Issues in specific browsers

#### Chrome/Chromium issues

**Solutions:**
- Update to latest version
- Try incognito mode
- Disable extensions temporarily
- Clear browser cache

#### Firefox issues

**Solutions:**
- Set `media.peerconnection.enabled` to `true`
- Enable `media.getusermedia.screensharing.enabled`
- Update to latest ESR version

#### Safari issues

**Solutions:**
- Ensure macOS 10.14+ and Safari 12+
- Enable "Allow websites to ask for permission to use camera and microphone"
- Check WebRTC permissions

#### Edge issues

**Solutions:**
- Update to latest Chromium-based Edge
- Enable WebRTC in browser settings
- Check compatibility mode

### Mobile browser issues

**Symptoms:**
- Screen sharing not available on mobile

**Limitations:**
- Screen sharing requires getDisplayMedia API
- Limited to Chrome on Android
- iOS Safari doesn't support screen sharing
- Use desktop browsers for full functionality

## Performance Issues

### High CPU usage

**Symptoms:**
- Browser becomes slow or unresponsive
- High CPU usage during screen sharing

**Solutions:**

1. **Optimize screen capture**:
   - Reduce frame rate if possible
   - Limit screen resolution
   - Use window capture instead of full screen

2. **Browser settings**:
   - Enable hardware acceleration
   - Update graphics drivers

3. **System optimization**:
   - Close unnecessary applications
   - Increase system RAM if possible

### Memory leaks

**Symptoms:**
- Browser memory usage keeps increasing
- Application becomes slower over time

**Solutions:**

1. **Browser maintenance**:
   - Clear browser cache regularly
   - Restart browser periodically
   - Update to latest browser version

2. **Application fixes**:
   - Ensure proper cleanup of WebRTC connections
   - Monitor for memory leaks in development

## Build and Deployment Issues

### Build fails

**Symptoms:**
- `npm run build` fails with errors

**Solutions:**

1. **Check dependencies**:
   ```bash
   npm audit
   npm update
   ```

2. **Clear build cache**:
   ```bash
   rm -rf client/dist server/dist
   npm run build
   ```

3. **TypeScript errors**:
   - Check for type errors: `npm run type-check`
   - Update TypeScript definitions

### Docker build fails

**Symptoms:**
- `docker-compose up --build` fails

**Solutions:**

1. **Check Docker resources**:
   - Ensure sufficient disk space
   - Increase Docker memory limit

2. **Network issues**:
   ```bash
   # Clear Docker cache
   docker system prune -a
   ```

3. **Platform-specific issues**:
   - Windows: Use Linux containers
   - macOS: Update Docker Desktop

### Production deployment issues

**Symptoms:**
- Application works locally but fails in production

**Solutions:**

1. **Environment variables**:
   - Verify all required env vars are set
   - Check `NODE_ENV=production`

2. **HTTPS configuration**:
   - Ensure SSL certificates are valid
   - Check nginx configuration

3. **Static file serving**:
   - Verify client assets are served correctly
   - Check file permissions

## Getting Help

If these solutions don't resolve your issue:

1. **Check the logs**:
   ```bash
   # Client logs (browser console)
   # Server logs
   tail -f server/logs/error.log
   ```

2. **Gather information**:
   - Browser version and OS
   - Network conditions
   - Steps to reproduce
   - Error messages and screenshots

3. **Create an issue** on GitHub with:
   - Clear problem description
   - Steps to reproduce
   - Environment details
   - Error logs and screenshots

4. **Community support**:
   - Check GitHub Discussions
   - Join community chats/forums

## Common Error Messages

### "getDisplayMedia is not a function"
- Browser doesn't support screen sharing API
- Update browser or use supported browser

### "ICE connection failed"
- Network connectivity issues
- Firewall blocking WebRTC traffic
- STUN/TURN server configuration

### "Room code is invalid"
- Check room code format (6 uppercase alphanumeric)
- Ensure room exists and hasn't expired

### "WebSocket connection failed"
- Server not running
- Firewall blocking WebSocket connections
- Incorrect server URL configuration

This troubleshooting guide covers the most common issues. For additional help, please refer to the project documentation or create an issue on GitHub.
