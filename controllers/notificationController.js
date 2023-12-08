const Notification = require('../model/notificationModel');
const User = require('../model/userModel');
const Group = require('../model/groupModel');
const Chat = require('../model/chatModel');

//SEND NOTIFICATION
const sendNotification = async (req, res) => {
    try {
        const { senderId, receiverId, groupId, chatId, message, type, status } = req.body;

        const notification = await Notification.create({
            senderId,
            receiverId,
            groupId,
            chatId,
            message,
            type,
            status,
        });
        res.status(201).json({success: true, notification});
    } catch(err) {
        res.status(500).json({ error: "FAILED TO SEND NOTIFICATION"});
    }
};

//GET NOTIFICATION FOR A USER
const getNotification = async(req, res ) => {
    try {
        const userId = req.params.userId;

        const notifications = await Notification.findAll({
            where : { receiverId: userId },
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({success: true, notifications});
    } catch(err) {
        res.status(500).json({ error: 'FAILED TO RETRIEVE NOTIFICATIONS'});
    }
};

module.exports = {
    sendNotification,
    getNotification
}