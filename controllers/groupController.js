const groupModel = require("../model/groupModel");

//GET GROUPS
const loadGroups = async (req, res, next) => {
    try {
        const allGroups = await groupModel.findAll();
        res.status(200).json({ allGroups : allGroups });
    } catch (error) {
        console.error('ERROR IN FETCHING GROUPS', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
};

//CREATE NEW GROUP
const createNewGroup = async(req, res, next) => {
    const { name, limit } = req.body;

    try {
        if(name == undefined || name.length === 0) {
            return res.status(400).json({ success: false, message: "PLEASE ENTER A NAME" });
        }
        const newGroup = await groupModel.create({ 
            name, limit
        });

        return res.status(200).json( { newGroup : newGroup } )
    } catch(err) {
        console.log("ERROR IN CREATING NEW GROUP", err);
        res.status(500).json({ success: false, error: err});
    }
}

const joinGroupById = async (req, res) => {
    
    try {
        const groupId = req.params.groupId;
        console.log("GROUP ID IS", groupId);

        if(!groupId) {
            return res.status(400).json({ error: 'GROUP ID MISSING'})
        }

        const group = await groupModel.findByPk(groupId);
        console.log("FOUND GROUP", groupId);

        if(!group) {
            return res.status(404).json({ error: "GROUP NOT FOUND "});
        }

        return res.status(201).json({ success: true, message: "JOINED GROUP SUCCESSFULLY "});
    } catch(err) {
        console.log("ERROR JOINING THE GROUP", err);
        return res.status(500).json({ error: 'INTERNAL SERVER ERROR'});
    }
}

module.exports = {
    loadGroups, 
    createNewGroup,
    joinGroupById
}