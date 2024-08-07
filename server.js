const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

mongoose.connect('mongodb://localhost/debate_club', { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas and models here
const UserSchema = new mongoose.Schema({ username: String, password: String });
const User = mongoose.model('User', UserSchema);

const DebateSchema = new mongoose.Schema({ topic: String, arguments: [String], votes: Number });
const Debate = mongoose.model('Debate', DebateSchema);

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username }, 'your_jwt_secret');
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Define routes for debate creation, participation, and voting

// Real-time chat
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('join', (room) => {
        socket.join(room);
    });
    socket.on('message', (msg) => {
        io.to(msg.room).emit('message', msg.text);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));
