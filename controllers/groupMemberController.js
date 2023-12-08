const groupMember = require('../model/groupMembers');

//JOIN A GROUP
const joinGroup = async (req, res) => {
    try {
        const { groupId, userId} = req.body;

        const existingMember = await groupMember.findOne ({
            where:{ groupId, userId},
        });

        if(existingMember) {
            return res.status(400).json({ error: "USER IS ALREADY A MEMBER"})
        }

        const GroupMember = await groupMember.create({
            groupId,
            userId,
        });

        res.status(201).json({ success: true, GroupMember});
    } catch(err) {
        res.status(500).json({ error: 'FAILED TO JOIN A GROUP'});
    }
};

const leaveGroup = async(req, res ) => {
    try {
        const{ groupId, userId} = req.body;

        const GroupMember = await groupMember.findOne({
            where: {
                groupId, userId
            }
        });

        if(!GroupMember) {
            return res.status (404).json({ error: 'USER IS NOT A MEMBER OF THE GROUP'});
        }

        await GroupMember.destroy();

        res.status(200).json({ message: "USER SUCCESSFULLY LEFT THE GROUP"});
    } catch(err) {
        res.status(500).json({ error: 'FAILED TO LEAVE THE GROUP'});
    }
} 

module.exports = {
    joinGroup,
    leaveGroup
}