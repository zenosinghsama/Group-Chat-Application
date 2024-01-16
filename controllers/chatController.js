const Chat = require("../model/chatModel");
const User = require("../model/userModel");


//SEND A CHAT MESSAGE
const sendMessage = async (req, res) => {
    try {
        const  { message, senderId, groupId, style } = req.body;
        console.log("MESSAGE BODY", req.body)
        const username = req.user.name;
        const userId = req.user.id;

        const chatMessage = await Chat.create ({
            message : message,
            senderId : senderId,
            groupId : groupId,
            userId: userId,
            username : username,
            style,
        });

        res.status(201).json({ success: true, chatMessage:{...chatMessage.toJSON(), style: chatMessage.style}  });
    } catch (err) {
        res.status(500).json({ error: "FAILED TO SEND CHAT MESSAGE"});
    }
};

const getGroupChatHistory = async (req, res ) => {
    try {
        const { groupId } = req.params;

        const chatHistory = await Chat.findAll({
            where : { groupId },
            order : [['createdAt', 'ASC']],
        });

        res.status(200).json({ chatHistory });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'INTERNAL SEVER ERROR'});
    }
}

module.exports = {
    sendMessage,
    getGroupChatHistory
};
