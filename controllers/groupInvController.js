const GroupInvitation = require('../model/groupInvitationModel');
const User = require('../model/userModel');
const Group = require('../model/groupModel');
const groupMember = require('../model/groupMembers');

//SEND GROUP INVITE
const sendInvitation = async (req, res) => {
    try {
        const { groupId, senderId, receiverId, status }= req.body;

        const groupInvitation = await GroupInvitation.create ({
            groupId,
            senderId,
            receiverId,
            status,
        });

        res.status(201).json({success: true, groupInvitation});
    } catch (err) {
        res.status(500).json({ error: "FAILED TO SEND INVITE"});
    }
};

//ACCEPT INVITATION
const acceptInvitation = async(req, res) => {
    try {
        const invitationId = req.params.invitationId;

        const groupInvitation = await GroupInvitation.findByPk(invitationId);
        if(!groupInvitation) {
            return res.status(404).json({ error: "GROUP INVITE NOT FOUND"});
        }

        groupInvitation.status = 'accepted';
        await groupInvitation.save();

        //ADD USER TO GROUP
        await groupMember.create({
            groupId: groupInvitation.groupId,
            userId: groupInvitation.receiverId,
        });

        res.status(200).json({success: true, groupInvitation});
} catch (err) {
    res.status(500).json({ error: "FAILED TO ACCEPT GROUP INVITE"});
    }
};

module.exports = { 
    sendInvitation,
    acceptInvitation
}