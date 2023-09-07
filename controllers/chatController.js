const chatModel = require("../model/chatModel");

//GET MESSAGE
const getMessages = async(req, res, next) => {
    try {
        const userId = req.user.id;
        const allMessages = await chatModel.findAll({ where: { userId }});

        res.status(200).json({ allMessages: allMessages })
    } catch(err) {
        console.log(`ERROR IN FETCHING MESSAGES`, JSON.stringify(err));
        res.status(500).json({ error: err });
    }
};

const addNewMessage = async(req, res, next) => {
    const { message } = req.body;
    const userId = req.user.id;

    console.log("USERID", userId, message);

    try {
        if (message == undefined || message.length === 0) {
            return res.status(400).json({ success: false, message: "PLEASE ENTER A MESSAGE"});
        }

        const newMessage = await chatModel.create({
            message, userId
        });

        return res.status(200).json({ newAddedMessage: newMessage});
    } catch(err) {
        console.log("ERROR IN POSTING NEW MESSAGE", err);
        res.status(500).json({ success: false, error: err});
    }
};

module.exports = {
    getMessages,
    addNewMessage
};