const users = {};
const typingUsers = {};
const messageReadStatus = {};
const activeGroups = {};

function handleSocketEvents(io) {
    io.on('connection', socket => {
        console.log("CONNECTED TO SOCKET.IO");

        socket.on('new-message', (data) => {
            // console.log("SOCKET NEW MESSAGE EMIT", data)

            io.emit('message-received', {
                messageId: data.id,
                senderId: data.senderId,
                message: data.message,
                isSender: socket.id === data.senderSocketId,
                style: data.style,
                username: data.username,
            });
        });

        socket.on('send-notification', (data) => {
            console.log('NOTIFICATION DATA', data);

            io.emit('offline-notification', {
                isSender: socket.id === data.senderId,
                groupId: data.groupId,
                senderId: data.senderId,
                message: data.message,
                username: data.username,
                isReadByAll: data.isReadByAll,
            })
        })

        socket.on('read-message', (data) => {
            const { groupId, userId, senderId, username, message } = data;

            const isMessageRead = true;

            if (!messageReadStatus[groupId]) {
                messageReadStatus[groupId] = {};
            }

            if (isMessageRead && senderId !== userId) {
                socket.emit('update-read-status', {
                    userId,
                    message: 'READ BY:' + userId,
                });
            } else {
                delete messageReadStatus[groupId][userId];
            }
        });

        socket.on('send-invite', (data) => {
            const { username, inviteLink } = data;
            console.log(data);
            const groupId = data.groupId;

            const recipientSocketId = users[username];

            if (recipientSocketId && io.sockets.connected[recipientSocketId]) {
                socket.to(recipientSocketId).emit('receive-invite', {
                    senderUsername: socket.id,
                    inviteLink,
                });

            } else {
                console.log(`Recipient ${username} is offline. Save the invitation in the database.`);
            }
        });

        socket.on('join-room', (groupId, userName) => {
            socket.join(groupId);
            console.log(`User ${userName} joined room ${groupId}`);

            const username = userName;

            socket.emit('user-joined', {
                username,
                groupId,
            })

            socket.emit('joined-room', { groupId, username });
        });

        socket.on('add-users-to-group', (groupId, selectedUsers) => {
            selectedUsers.forEach(user => {
                // console.log("user", user);
                const systemMessage = `${user.username} was added to the group`;

                socket.emit('user-added-to-group', systemMessage);
            });
            console.log("SELECTED USERS", selectedUsers);
            socket.broadcast.emit('user-added-to-group', 'YOU WERE ADDED TO THIS GROUP');
        })

        socket.on('disconnect', () => {
            console.log("USER DISCONNECTED", socket.id);
        });
    });
}

module.exports = { handleSocketEvents }