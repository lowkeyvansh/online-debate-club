import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
    const [debates, setDebates] = useState([]);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);

    useEffect(() => {
        socket.on('message', msg => {
            setChat(prevChat => [...prevChat, msg]);
        });
    }, []);

    const fetchDebates = async () => {
        const result = await axios.get('http://localhost:3000/debates');
        setDebates(result.data);
    };

    const sendMessage = () => {
        socket.emit('message', { room: 'debate-room', text: message });
        setMessage('');
    };

    return (
        <div>
            <h1>Online Debate Club</h1>
            <button onClick={fetchDebates}>Fetch Debates</button>
            <ul>
                {debates.map(debate => (
                    <li key={debate._id}>{debate.topic}</li>
                ))}
            </ul>
            <div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            <div>
                <h2>Chat</h2>
                <ul>
                    {chat.map((msg, index) => (
                        <li key={index}>{msg.text}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
