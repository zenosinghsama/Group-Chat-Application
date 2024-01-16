const User = require("../model/userModel");
const Group = require("../model/groupModel");
const GroupMember = require("../model/groupMembers");
const GroupMessages = require("../model/chatModel");

//CREATE A NEW GROUP
const createGroup = async (req, res) => {


  try {
    const { name, adminId, selectedUsers } = req.body;
  
    let parsedUsers;
    try {
      parsedUsers = JSON.parse(selectedUsers);
      console.log("PARSED USERS", parsedUsers);

    } catch (err) {
      return res.status(400).json({ error: "Invalid user input" });
    }
    const newGroup = await Group.create({
      groupName: name,
      adminId,
      groupImageUrl: 'images/' + req.file.filename,
    });

    await GroupMember.create({
      groupId: newGroup.id,
      userId: adminId,
    });

    parsedUsers.forEach(async (user) => {
      console.log(user, "USER");
      const memberAdd = await GroupMember.create({
        groupId: newGroup.id,
        userId: parseInt(user),
      })
      console.log(memberAdd,"ADD MEMBERS")
    })

    return res.status(201).json({ newGroup: newGroup });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "FAILED TO CREATE THE GROUP" });
  }
};

//GET ALL USER GROUPS
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const userGroups = await GroupMember.findAll({
      where: { userId },
      include: [{ model: Group, as: 'group' }]
    });

    if (!userGroups || userGroups.length === 0) {
      return res.status(200).json({ success: true, message: "USER IS NOT A MEMBER OF ANY GROUP" });
    }

    const groups = userGroups.map((groupMember) => groupMember.group);

    res.status(200).json({ success: true, groups: groups });
  } catch (err) {
    console.log("ERROR GETTING GROUPS", err);
    res.status(500).json({ error: "FAILED TO GET GROUPS" });
  }
}

//ADD USER TO A GROUP
const addMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;

    const existingMember = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'USER IS ALREADY A MEMBER OF THE GROUP ' });
    }

    const groupMember = await GroupMember.create({
      groupId,
      userId,
    });

    res.status(201).json({ success: true, groupMember });
  } catch (err) {
    res.status(500).json({ error: "FAILED TO ADD USER" });
  }
}

//ADD USERS TO EXISTING GROUP
const addToExistingGroup = async (req, res) => {
  
  try {
    const groupId = req.params.groupId;
    const { selectedUserIds } = req.body;

    const group = await Group.findOne({
      where: { id: groupId },
    });

    if(!group) {
      return res.status(404).json({ error: "GROUP NOT FOUND" });
    }

    const addedUsers = [];

    for(const userId of selectedUserIds) {
      const existingMember = await GroupMember.findOne({
        where: { groupId, userId }, 
      });

      if(!existingMember) {
        const newMember = await GroupMember.create({
          groupId,
          userId,
        })

        addedUsers.push(newMember);
      }
    }

    res.status(200).json({ success: true, addedUsers });
  } catch (err) {
    console.error('Error adding users to the group:', err);
    res.status(500).json({ error: 'FAILED TO ADD USERS TO THE GROUP' });
  }
}

//ADD TO GROUP VIA LINK
const addViaLink = async (req, res) => {
  try {
  
    const {userId, groupId} = req.body;

    console.log("IDS", req.body)

    const group = await Group.findOne({ where: { id: groupId } });

    if(!group) {
      throw Error("No such group exists");
    }

    const existingMember = await GroupMember.findOne({
      where: {
        groupId, userId
      },
    });

    if(existingMember) {
      throw Error(`User is already a member of this group`);
    }

    const newMember = await GroupMember.create({
      groupId,
      userId,
    })

    console.log("NEW", newMember)

    res.status(201).json({ success: true, addedUser : newMember });
 
  } catch (err) {
    console.log(err,"ERROR ADDING USER VIA LINK");
    res.status(500).json({ error: 'FAILED TO JOIN THE GROUP'});
  }
}

//GET GROUP DETAILS
const getGroupDetails = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const group = await Group.findOne({
      where: { id: groupId },
      include: [{
        model: User,
        as: 'admin',
      }, {
        model: GroupMember,
        as: 'groupMembers',
        include: [
          {
            model: User,
            as: 'user',
          },
        ],
      }],
    });


    if (!group) {
      return res.status(404).json({ error: 'GROUP NOT FOUND' })
    }

    const groupDetails = {
      id: group.id,
      groupName: group.groupName,
      adminId: group.adminId,
      adminName: group.admin.name,
      groupImage: group.groupImageUrl,
      members: group.groupMembers ? group.groupMembers.map((member) => ({
        id: member.id,
        userId: member.user.id,
        username: member.user.name,
      })) : [],
    };

    res.status(200).json({ success: true, group: groupDetails });
  } catch (err) {
    console.log("ERROR GETTING GROUP DETAILS", err);
    res.status(500).json({ error: "FAILED TO GET GROUP DETAILS" });
  }
};

//UPDATE GROUP DETAILS
const updateGroupDetails = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const newGroupName = req.body.newGroupName;

    const group = await Group.findOne({
      where: {
        id: groupId
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'GROUP NOT FOUND' });
    }

    group.groupName = newGroupName;
    await group.save();

    res.status(200).json({ success: true, message: 'GROUP DETAILS UPDATED SUCCESSFULLY' });
  } catch (err) {
    console.log('ERROR UPDATING GROUP DETAILS', err);
    res.status(500).json({ error: 'SERVER ERROR UPDATING GROUP DETAILS' });
  }

}

//REMOVE USERS FROM GROUP
const removeUsers = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { adminId } = req.body;

    const group = await Group.findOne({
      where: { id: groupId, adminId: adminId },
      include: [
        { model: User, as: 'admin' },
        { model: GroupMember, as: 'groupMembers', include: [{ model: User, as: 'user' }] },
      ],
    });

    if (!group) {
      return res.status(404).json({ error: 'NO GROUP WITH THAT ID EXISTS!' });
    }

    if (group.adminId !== adminId) {
      console.log(group.adminId, adminId);
      return res.status(403).json({ error: 'PERMISSION DENIED' });
    }

   const userIdsINGroup = group.groupMembers.map(member => member.dataValues.userId)

   const userNamesInGroup = group.groupMembers.map(member => member.user.name)
   console.log("USERNAMES IN GROUP BEFORE REMOVAL", userNamesInGroup);

   const userToRemove = parseInt(userId);

    const indexToRemove = userIdsINGroup.indexOf(userToRemove);

    if(indexToRemove !== -1) {
      userIdsINGroup.splice(indexToRemove, 1);
    }

    await group.removeUser(userToRemove);
    console.log("USER REMOVED FROM THE GROUP");

    // Now userNamesInGroup array and the group have been updated
    console.log("USERNAMES IN GROUP AFTER REMOVAL", userNamesInGroup);

    return res.status(200).json({
      success: true,
      message: 'USER REMOVED FROM THE GROUP',
      removedUserName: userNamesInGroup[indexToRemove],
    });
  } catch (err) {
    console.error(err, 'Error removing user from the group');
    res.status(500).json({ error: 'Failed to remove user from the group.' });
  }
};


module.exports = {
  createGroup,
  getUserGroups,
  addMember,
  addViaLink,
  getGroupDetails,
  updateGroupDetails,
  removeUsers,
  addToExistingGroup,
}