import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import matchRoutes from './routes/match.routes';

const app = express();
const server = http.createServer(app);

// Initialize the WebSocket server instance attached to our HTTP server
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Make the WebSocket server accessible to our controllers
app.set('wss', wss);

app.use('/api/matches', matchRoutes);

// Log when React connects to the socket
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected to WebSocket channel');
  ws.on('close', () => console.log('Client disconnected from WebSocket channel'));
});

const PORT = process.env.PORT || 3000;

/* ignore next */
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server & WebSocket running in RAM-only mode on http://localhost:${PORT}`);
  });
}

export default server;