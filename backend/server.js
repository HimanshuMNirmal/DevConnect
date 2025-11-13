const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
require('dotenv').config();

// IMPORT SOCKET.IO AND PRISMA CONFIGURATION
const setupSocket = require('./socket/socket');
const prisma = require('./config/prisma');

// IMPORT API ROUTE HANDLERS
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// INITIALIZE SOCKET.IO FOR REAL-TIME COMMUNICATION
const io = setupSocket(server);

// ATTACH IO INSTANCE TO EXPRESS APP FOR ROUTE ACCESS
app.set('io', io);

// MOUNT API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// GLOBAL ERROR HANDLER MIDDLEWARE
// Catch and handle all unhandled errors from route handlers
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// GRACEFUL SHUTDOWN
// Close database connection when server shuts down
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;
