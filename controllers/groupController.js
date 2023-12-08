const User = require("../model/userModel");
const Group = require("../model/groupModel");
const GroupMember = require("../model/groupMembers");
const GroupMessages = require("../model/chatModel");


// //CREATE A NEW ROOM
// const createNewRoom = async (req, res) => {
//   const { name, description, memberLimit, iconUrl, createdBy, admins } = req.body;
//   const groupId = req.query.groupId;
  
//     try {

//         if(name == undefined || name.length === 0) {
//           return res.status(400).json({ success: false, message: "PLEASE ENTER A NAME" });
//       }

//         //CHECK IF ROOM NAME IS UNIQUE
//         const existingRoom = await roomModel.findOne({ where: { name }});
//         if(existingRoom) {
//             return res.status(400).json({ error: "ROOM NAME ALREADY EXISTS" });
//         }

//         let room;
//         if(groupId) {
//           room = await roomModel.findByPk(groupId);
//           if(!room) {
//             return res.status(404).json({ error: "GROUP NOT FOUND "});
//           } 

//           if (room.memberCount >= room.memberLimit) {
//             return res.status(400).json({ error: "GROUP IS CURRENTLY FULL"})
//           }

//           room.memberCount++
//         } else {  
//           //CREATE NEW ROOM
//           room = await roomModel.create({
//             name,
//             description,
//             createdBy,
//             memberLimit,
//             admins,
//             iconUrl,
//             memberCount: 1,
//           });

//           await userRoom.create({ userId: createdBy, roomId: room.id });
//         }
//         res.status(201).json({ success: true, room: room });
//     } catch(err) {
//         console.log("ERROR CREATING ROOM", err);
//         res.status(500).json({ error: "FAILED TO CREATE A ROOM"});
//     }
// };

// //GET LIST OF ROOMS
// const getListOfRooms = async (req, res) => {
//     try{
//         const rooms = await roomModel.findAll({
//           include: [
//             {
//               model: User,
//               as: 'createdByUser',
//             },
//             {
//               model:userRoom,
//               attributes: [],
//             },
//           ],
//         });
//         res.status(200).json({success :true, rooms });
//     } catch (err) {
//         console.log("ERROR GETTING ROOMS",err);
//         res.status(500).json({ error: "FAILED TO RETRIEVE ROOMS "}); 
//     }
// };

// //GET ROOM BY ID
// const getRoomById = async (req,res) => {
//     const roomId = req.params.roomId;
//     try {
//         const room = await roomModel.findByPk(roomId);
//         if(!room) {
//             return res.status(404).json({ error: "NO ROOM FOUND "});
//         }
//         res.status(200).json({success: true, room});
//     } catch(err) {
//         console.log(err);
//         res.status(500).json({ error: "FAILED TO GET ROOM"});
//     }
// };

// //UPDATE ROOM DETAILS
// const updateRoom = async (req, res) => {
//     const roomId = req.params.roomId;
//     const { name, description, memberLimit, admins, iconUrl } = req.body;
  
//     try {
//       const room = await roomModel.findByPk(roomId);
//       if (!room) {
//         return res.status(404).json({ error: "Room not found" });
//       }
  
//       // Update room details
//       room.name = name;
//       room.description = description;
//       room.memberLimit = memberLimit;
//       room.admins = admins;
//       room.iconUrl = iconUrl;
  
//       await room.save();
  
//       res.status(200).json(room);
//     } catch (error) {
//       console.error("Error updating room", error);
//       res.status(500).json({ error: "Failed to update room" });
//     }
//   };

//   //DELETE ROOM BY ID
//   const deleteRoom = async (req, res) => {
//     const roomId = req.params.roomId;
//     try {
//       const room = await roomModel.findByPk(roomId);
//       if (!room) {
//         return res.status(404).json({ error: "Room not found" });
//       }
  
//       // Delete the room
//       await room.destroy();
  
//       res.status(204).send();
//     } catch (error) {
//       console.error("Error deleting room", error);
//       res.status(500).json({ error: "Failed to delete room" });
//     }
//   };

// //JOIN ROOM
// const joinRoom = async (req, res) => {
//   const { roomName, groupId } = req.body;
//   const user = req.user.id

//   try {
//     const existingMember = await userRoom.findOne({
//       where: { userId: user.id, roomId: groupId, isActive: true }
//     });

//     if(existingMember) {
//       return res.status(400).json({ error: "USER IS ALREADY A MEMBER OF THE GROUP"});
//     }

//     await userRoom.create({ userId: user.id, roomId: groupId, isActive: true});

//     res.status(201).json({ success: true, message: "USER JOINED THE GROUP"});
//   } catch(err) {
//     console.log("ERROR JOINING ROOM", err);
//     res.status(500).json({ error: "FAILED TO JOIN ROOM"});
//   }
// }

// //GET ALL ROOMS USER IS MEMBER OF
// const getUserRooms = async (req, res) => {
//   const user = req.user.id;

//   try {
//     const userRooms = await userRoom.findAll({ 
//       where: { userId: user.id, isActive: true },
//       include:[{ model: roomModel }]
//     });

//     res.status(200).json({success: true, roomModel });
//   } catch(err) {
//     console.log("ERROR GETTING USER ROOMS",err);
//     res.status(500).json({ error: "FAILED TO GET USER ROOMS"});
//   }
// };
 



//CREATE A NEW GROUP
const createGroup = async (req, res) => {
  console.log("CREATING GROUp")

  try {
    const {name, adminId, users} = req.body;
    console.log("GROUP BODY",req.body);

    const newGroup = await Group.create({
      groupName: name, 
      adminId,
    });

    console.log("GROUP", req.body);
// ['sam', 'zeno']

    // const userIds = users.map((user) =>{
      
    // })

    await GroupMember.create({
      groupId: newGroup.id,
      userId: adminId,
    });

    users.forEach(async(user) => {
      const memberAdd = await GroupMember.create({
        groupId: newGroup.id,
        userId: parseInt(user),
      })
      console.log(memberAdd)
    })



    console.log("GROUP ID IS :" , newGroup.id,
    "ADMIN ID IS: ", adminId);

    return res.status(201).json({ newGroup: newGroup });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "FAILED TO CREATE THE GROUP"});
  }
};

//GET ALL GROUPS
const getUserGroups = async (req, res) => {
  try {  
    const userId = req.user.id;

    const userGroups = await GroupMember.findAll({
      where: { userId},
      include: [{ model: Group, as: 'group'}]
    });

    console.log(userGroups, "GROUPS");

    if (!userGroups || userGroups.length === 0){
      return res.status(200).json({ success: true, message: "USER IS NOT A MEMBER OF ANY GROUP" });
    }
    
    const groups = userGroups.map((groupMember) => groupMember.group);

    res.status(200).json({ success: true, groups: groups });
  } catch(err) {
    console.log("ERROR GETTING GROUPS",err);
    res.status(500).json({ error: "FAILED TO GET GROUPS"});
  }
}

//ADD USER TO A GROUP
const addMember = async(req, res) => {
  try {
    const  { groupId, userId } = req.body;

    const existingMember = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if(existingMember) {
      return res.status(400).json({ error: 'USER IS ALREADY A MEMBER OF THE GROUP '});
    }

    const groupMember = await GroupMember.create({
      groupId,
      userId,
    });

    res.status(201).json({ success: true, groupMember});
  } catch (err) {
    res.status(500).json({error: "FAILED TO ADD USER"});
  }
}

  module.exports = {
   createGroup,
   getUserGroups,
   addMember,
  }