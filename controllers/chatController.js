const Chat = require("../model/chatModel");
const User = require("../model/userModel");


//GET MESSAGE
// const getMessages = async (req, res, next) => {
//     const { room } = req.query;
//     try {
//         const allMessages = await chatModel.findAll({ 
//             where: { room }
//         });
//         res.status(200).json({ success: true,  data: allMessages })
//     } catch(err) {
//         console.log(`ERROR IN FETCHING MESSAGES`, JSON.stringify(err));
//         res.status(500).json({ success: false,  error: 'FAILED TO FETCH MESSAGES' });
//     }
// };

// const addNewMessage = async(req, res, next) => {
//     const { message } = req.body;
//     const userId = req.user.id;
//     const name = req.user.name;

//     try {
//         if (message == undefined || message.length === 0) {
//             return res.status(400).json({ success: false, message: "PLEASE ENTER A MESSAGE"});
//         }

//         const newMessage = await chatModel.create({
//             message, userId, name
//         });

//         return res.status(200).json({ newAddedMessage: newMessage});
//     } catch(err) {
//         console.log("ERROR IN POSTING NEW MESSAGE", err);
//         res.status(500).json({ success: false, error: err});
//     }
// };


//SEND A CHAT MESSAGE
const sendMessage = async (req, res) => {
    try {
        const  { message, senderId, groupId } = req.body;
        const username = req.user.name;
        const userId = req.user.id;
        console.log("MESSAGE BODY",req.body);

        const chatMessage = await Chat.create ({
            message : message,
            senderId : senderId,
            groupId : groupId,
            userId: userId,
            username : username,
        });

        console.log("MESSAGE SENT",chatMessage);
        res.status(201).json({ success: true, chatMessage: chatMessage });
    } catch (err) {
        res.status(500).json({ error: "FAILED TO SEND CHAT MESSAGE"});
    }
};

//GET CHAT HISTORY OF USER
// const getChatHistory = async (req, res) => {
//     try {
//         const userId = req.params.userId;

//         const chatHistory = await Chat.findAll({
//             where: {
//                 [Op.or]: [{senderId: userId}, {receiverId: userId}],
//             },
//             order:[['createdAt', 'ASC']],
//         });

//         res.status(200).json({success: true, chatHistory});
//     } catch(err) {
//         res.status(500).json({ error: 'FAILED TO RETRIEVE CHAT HISTORY' });
//     }
// };

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
    // getChatHistory,
    getGroupChatHistory
};
