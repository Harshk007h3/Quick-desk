const io = require('socket.io');

let socketIO;

const initializeRealTimeService = (server) => {
    socketIO = require('socket.io')(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    socketIO.on('connection', (socket) => {
        console.log('Client connected to real-time service');

        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`Client joined room: ${roomId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected from real-time service');
        });
    });

    return socketIO;
};

const broadcastTicketCreated = async (ticketId, room) => {
    if (socketIO) {
        socketIO.to(room).emit('ticket_created', { ticketId });
    }
};

const broadcastTicketUpdated = async (ticketId, room) => {
    if (socketIO) {
        socketIO.to(room).emit('ticket_updated', { ticketId });
    }
};

const broadcastUserStatusChanged = async (userId, role) => {
    if (socketIO) {
        socketIO.emit('user_status_changed', { userId, role });
    }
};

module.exports = {
    initializeRealTimeService,
    broadcastTicketCreated,
    broadcastTicketUpdated,
    broadcastUserStatusChanged
};
