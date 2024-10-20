const socket = io();
let currentChat = null;
let username = localStorage.getItem('username') || '';

document.addEventListener('DOMContentLoaded', () => {
    if (username) {
        document.getElementById('username-input').style.display = 'none';
        document.getElementById('chat-controls').style.display = 'block';
    } else {
        document.getElementById('username-input').style.display = 'block';
    }
});

function setUsername() {
    const input = document.getElementById('username');
    username = input.value.trim();
    if (username) {
        localStorage.setItem('username', username);
        input.disabled = true;
        document.getElementById('username-input').style.display = 'none';
        document.getElementById('chat-controls').style.display = 'block';
    } else {
        alert('Por favor, insira um nome válido.');
    }
}

socket.on('newMessage', (message) => {
    if (currentChat) {
        const chatDiv = document.getElementById('chat-container');
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${message.sender === username ? 'me' : 'others'}`;
        const dot = message.read ? '' : '<div class="dot"></div>';
        msgDiv.innerHTML = `${dot}<div class="text">${message.text}</div><p>${message.sender}</p>`;
        chatDiv.appendChild(msgDiv);
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }
});

function joinChat(chatId) {
    if (currentChat) {
        socket.emit('leaveChat', currentChat);
    }
    currentChat = chatId;
    socket.emit('joinChat', chatId);
    document.getElementById('chat-container').innerHTML = `<h2>Chat ${chatId}</h2>`;
    loadChatMessages(chatId);
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message) {
        socket.emit('sendMessage', { chatId: currentChat, message, sender: username });
        input.value = '';
        input.focus();
    }
}

function loadChatMessages(chatId) {
    socket.emit('loadMessages', { chatId });
}

socket.on('loadChatMessages', (messages) => {
    const chatDiv = document.getElementById('chat-container');
    chatDiv.innerHTML = '';
    messages.forEach(message => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${message.sender === username ? 'me' : 'others'}`;
        msgDiv.innerHTML = `<div class="text">${message.text}</div><p>${message.sender}</p>`;
        chatDiv.appendChild(msgDiv);
    });
    chatDiv.scrollTop = chatDiv.scrollHeight;
});