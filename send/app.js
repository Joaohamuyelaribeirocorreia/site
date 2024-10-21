const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const CHAT_FILE = path.join(__dirname, 'chats.json');
const UPLOAD_DIR = path.join(__dirname, 'public', 'file_upload_message');

// Middleware para servir arquivos estáticos
app.use(express.static('public'));
app.use((req, res) => {
  res.status(404).send('Página não encontrada');
});
app.get("/",(req, res) => {
  res.status(200).send('"Bem-vindo!');
});
// Middleware para lidar com uploads de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${crypto.randomBytes(16).toString('hex')}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// Inicializar chats no arquivo se não existirem
if (!fs.existsSync(CHAT_FILE)) {
    fs.writeFileSync(CHAT_FILE, JSON.stringify({}));
}

// Função para ler chats
function readChats() {
    const data = fs.readFileSync(CHAT_FILE, 'utf8');
    return JSON.parse(data);
}

// Função para escrever chats
function writeChats(chats) {
    fs.writeFileSync(CHAT_FILE, JSON.stringify(chats, null, 2));
}

// Configuração de eventos do Socket.IO
io.on('connection', (socket) => {
    console.log(`Um usuário ${socket.id} conectado`);

    // Enviar chats ao novo cliente
    socket.emit('loadChats', readChats());

    // Entrar em um chat específico
    socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`Usuário ${socket.id} entrou no chat ${chatId}`);
        
        const chats = readChats();
        const messages = chats[chatId] ? chats[chatId].messages : [];
        socket.emit('loadChatMessages', messages);
    });

    // Enviar uma mensagem para um chat
    socket.on('sendMessage', (data) => {
        const { chatId, message, file, sender } = data;
        const chats = readChats();
        
        if (!chats[chatId]) {
            chats[chatId] = { messages: [], users: [] };
        }

        const newMessage = {
            id: crypto.randomBytes(16).toString('hex'), // Gerar ID único
            text: message || '',
            timestamp: new Date(),
            sender: sender,
            read: false,
            file: file ? { url: file.url, type: file.type, name: file.name } : null // Ajustar a URL do arquivo
        };

        chats[chatId].messages.push(newMessage);
        writeChats(chats);
        io.to(chatId).emit('newMessage', newMessage);
    });

    // Upload de arquivo e enviar mensagem
    app.post('/upload', upload.single('file'), (req, res) => {
        if (req.file) {
            res.json({
                filename: req.file.filename,
                originalname: req.file.originalname,
                type: req.file.mimetype,
                url: `/file_upload_message/${req.file.filename}`
            });
        } else {
            res.status(400).json({ error: 'Falha ao fazer upload do arquivo!' });
        }
    });

    // Marcar mensagem como lida
    socket.on('markAsRead', (data) => {
        const { chatId, index } = data;
        const chats = readChats();
 
        if (chats[chatId] && chats[chatId].messages[index]) {
            chats[chatId].messages[index].read = true;
            writeChats(chats);
        }
    });

    //atualizar estado de progresso
    socket.on("estado", function(progress){
        socket.emit("estado", progress)
    })

    // Sair de um chat específico
    socket.on('leaveChat', (chatId) => {
        socket.leave(chatId);
        console.log(`Usuário ${socket.id} saiu do chat ${chatId}`);
    });

    // Desconectar
    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
