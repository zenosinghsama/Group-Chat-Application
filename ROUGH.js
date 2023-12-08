const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send");
const chatMsg = document.getElementById("chat-messages");

//DOM CONTENT
document.addEventListener("DOMContentLoaded", async() => {
    try {
        const token = localStorage.getItem("Token");

        if(!token) {
            return (window.location.href = "/login.html");     
        }

        // const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
        // const recentMessages = storedMessages.slice(-MaxChatMsg);

        const userName = localStorage.getItem("Name");
        const joinMessage = `${userName} joined the chat`;
        showMessageOnScreen(userName, joinMessage, true);

        // recentMessages.forEach((messageObj) => {
        //     const messageText = messageObj.message;
        //     const isSentByCurrentUser = messageObj.userId === localStorage.getItem("ID");
        //     showMessageOnScreen(messageText, isSentByCurrentUser);
        // });

        displayMessages();
        await fetchAndDisplayMsg();
    } catch(err) {
        console.log("NO TOKEN FOUND", err);
    }
});

//FETCH MESSAGE FROM DB
async function fetchAndDisplayMsg() {
    try {
        const token = localStorage.getItem("Token");

        const response = await axios.get("/messages", {
            headers : {
                Authorization : `${token}`
            }
        });

        const newMessages = response.data.allMessages
        // .filter((messageObj) => {
        //     return !isMessageInLocalStorage(messageObj);
        // });

        newMessages.forEach((messageObj) => {
            const messageText = messageObj.message;
            const isSentByCurrentUser = 
                messageObj.userId === localStorage.getItem("ID");
            showMessageOnScreen(messageObj.userName, messageText, isSentByCurrentUser);

            // if(!isMessageInLocalStorage(messageObj)) {
            //     addToLocalStorage(messageObj);
            // }
        }) ;
    } catch (err) {
        console.log("ERROR IN FETCHING MESSAGE", err);
    }
}

//DISPLAY NEW MESSAGES FROM LOCAL STORAGE
// async function fetchAndDisplayNewMsg() {
//     try {
//         newMessages.forEach(async (messageObj) => {
//             const messageText = messageObj.message;
//             const userId = messageObj.userId;

//             const user = await User.findByPk(userId);

//             if(user) {
//                 const userName = user.name;
//                 console.log("userNAME", user.name);
//                 const isSentByCurrentUser = messageObj.userId === localStorage.getItem("ID");
//                 showMessageOnScreen(userName, messageText, isSentByCurrentUser);
//             }
//             // Add the new message to local storage
//             addToLocalStorage(messageObj);
//         });
//     } catch (err) {
//         console.log("ERROR IN FETCHING MESSAGE", err);
//     }
// }

// const MaxChatMsg = 10;
// function isMessageInLocalStorage(messageObj) {
//     const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];

//     if(storedMessages.length >= MaxChatMsg) {
//         storedMessages.shift();
//     }

//     const isMessageAlreadyStored = storedMessages.some((storedMessages) => {
//         storedMessages.message === messageObj.message &&
//         storedMessages.userName === messageObj.userName
//     });

//     if(!isMessageAlreadyStored) {
//     storedMessages.push(messageObj);
//     localStorage.setItem("chatMessages", JSON.stringify(storedMessages));
// }
// }

// function addToLocalStorage(messageObj) {
//     const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
//     storedMessages.push(messageObj);
//     localStorage.setItem("chatMessages", JSON.stringify(storedMessages));
// }

function displayMessages() {
    // const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    const chatBox = document.getElementById("chatBox");

    const messageFromAPI = [];

    messageFromAPI.forEach((messageObj) => {
        const  {
            userName,
            message,
            isSentByCurrentUser
        } = messageObj;

        showMessageOnScreen(userName, message, isSentByCurrentUser);

        // isMessageInLocalStorage(messageObj);
    })
}

//SHOW MSG ON SCREEN
function showMessageOnScreen(userName, message, isSentByCurrentUser ) {
    const chatBox = document.getElementById("chatBox");
    const messageContainer = document.createElement("div");
    messageContainer.className =  "message";
    
    const messageText = document.createElement("div");
    messageText.textContent = message;

    const messageBubble = document.createElement("div");
    messageBubble.textContent = message;

    if(isSentByCurrentUser) {
        const userNameSpan = document.createElement("span");
        userNameSpan.className = "username current-user";
        userNameSpan.textContent = userName;

        messageContainer.appendChild(userNameSpan);
    } else {
        const senderUserName = document.createElement("div");
        senderUserName.className = "username";
        senderUserName.textContent = userName;

        messageContainer.appendChild(senderUserName);
    }

    messageContainer.appendChild(messageText);
    chatBox.appendChild(messageContainer);
}

 //SAVE TO DB
 async function saveToDB(message) {
    const userName = localStorage.getItem("Name");

    if (message === "User joined the chat") {
        message = `${userName} joined the chat`;
    }

    const data = {
        message : message,
        name: userName,
    };

    try {
        const token = localStorage.getItem("Token");

        const response = await axios.post("/sendMessage", data, {
            headers: {
                Authorization : `${token}`,
            }
        });

        messageInput.value = "";

        const newMessage = response.data.newAddedMessage.message;
        showMessageOnScreen(userName, newMessage, true);

        // addToLocalStorage(response.data.newAddedMessage);
        
    } catch (err) {
        alert("ERROR IN SAVING MESSAGE TO DB");
        console.log(err);
    }
}

sendBtn.addEventListener("click", function() {
    const message = messageInput.value.trim();
    if(message !== "") {
        saveToDB(message);
    }
});





function displayMessages() {
    
    const messagesFromAPI = [];

    messagesFromAPI.forEach((messageObj) => {
        const { name, message, isSentByCurrentUser } = messageObj;
        
        showMessageOnScreen(name, message, isSentByCurrentUser);
    });
}


WAVE CSS

/* WAVE */
@keyframes move_wave {
    0% {
      transform: translateX(0) translateZ(0) scaleY(1);
    }
    50% {
      transform: translateX(-25%) translateZ(0) scaleY(0.55);
    }
    100% {
      transform: translateX(-50%) translateZ(0) scaleY(1);
    }
  }
  .waveWrapper {
    overflow: hidden;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    margin: auto;
    z-index: 1;
  }
  .waveWrapperInner {
    position: absolute;
    width: 100%;
    overflow: hidden;
    height: 100%;
    bottom: -1px;
    background-image: linear-gradient(to top, #86377b 20%, #27273c 80%);
  }
  .bgTop {
    z-index: 15;
    opacity: 0.5;
  }
  .bgMiddle {
    z-index: 10;
    opacity: 0.75;
  }
  .bgBottom {
    z-index: 5;
  }
  .wave {
    position: absolute;
    left: 0;
    width: 200%;
    height: 100%;
    background-repeat: repeat no-repeat;
    background-position: 0 bottom;
    transform-origin: center bottom;
  }
  .waveTop {
    background-size: 50% 100px;
  }
  .waveAnimation .waveTop {
    animation: move-wave 3s;
    -webkit-animation: move-wave 3s;
    -webkit-animation-delay: 1s;
    animation-delay: 1s;
  }
  .waveMiddle {
    background-size: 50% 120px;
  }
  .waveAnimation .waveMiddle {
    animation: move_wave 10s linear infinite;
  }
  .waveBottom {
    background-size: 50% 100px;
  }
  .waveAnimation .waveBottom {
    animation: move_wave 15s linear infinite;
  }
  
  
  MAIN>CSS
  
/* WAVE */
@keyframes move_wave {
  0% {
    transform: translateX(0) translateZ(0) scaleY(1);
  }
  50% {
    transform: translateX(-25%) translateZ(0) scaleY(0.55);
  }
  100% {
    transform: translateX(-50%) translateZ(0) scaleY(1);
  }
}
.waveWrapper {
  overflow: hidden;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  margin: auto;
  z-index: 1;
}
.waveWrapperInner {
  position: absolute;
  width: 100%;
  overflow: hidden;
  height: 100%;
  bottom: -1px;
  background-image: linear-gradient(to top, #86377b 20%, #27273c 80%);
}
.bgTop {
  z-index: 15;
  opacity: 0.5;
}
.bgMiddle {
  z-index: 10;
  opacity: 0.75;
}
.bgBottom {
  z-index: 5;
}
.wave {
  position: absolute;
  left: 0;
  width: 200%;
  height: 100%;
  background-repeat: repeat no-repeat;
  background-position: 0 bottom;
  transform-origin: center bottom;
}
.waveTop {
  background-size: 50% 100px;
}
.waveAnimation .waveTop {
  animation: move-wave 3s;
  -webkit-animation: move-wave 3s;
  -webkit-animation-delay: 1s;
  animation-delay: 1s;
}
.waveMiddle {
  background-size: 50% 120px;
}
.waveAnimation .waveMiddle {
  animation: move_wave 10s linear infinite;
}
.waveBottom {
  background-size: 50% 100px;
}
.waveAnimation .waveBottom {
  animation: move_wave 15s linear infinite;
}


/* Chat Container */
.chat-container {
  background-color: #27273c; 
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px #dcdddd;
  max-width: 1000px; 
  width: 90%; 
  margin: 0px auto; 
  position: absolute; /* Add this to position it relative to its parent */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  color: #fff; 
  transition: padding-left 0.3s ease;
}

/* Chat Title */
.chat-container h2 {
  font-size: 28px; /* Increase the title font size */
  margin: 0;
  text-align: center;
  margin-bottom: 20px; /* Add some spacing below the title */
}

/* Chat Messages */
.chat-messages {
  max-height: auto; /* Increase the maximum height */
  overflow-y: auto;
  border: 1px solid #4a4a6e; /* Match the border color to the wave */
  border-radius: 10px;
  padding: 15px; /* Increase padding */
  margin-top: 20px; /* Add more spacing at the top */
}
.chatBox {
  height: auto;
}

/* Style for sender's messages on the right */
.message.right {
display: flex;
justify-content: flex-end;
background-color: #77306e;
color: #fff;
padding: 10px;
border-radius: 10px;
margin-bottom: 10px;
max-width: 50%;
text-align: right;
margin-left: auto;
}

/* Style for receiver's messages on the left */
.message.left {
background-color: #e5e5e5;
  color: #333;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  max-width: 50%;
  text-align: left; 
}

.message.center {
display: flex;
justify-content: center;
background-color: #32324e;
color: #ffffff;
padding: 5px;
text-align: center;
border-radius: 10px;
margin-top: 5px;
margin-bottom: 5px;
margin-left: auto;
margin-right: auto;
}

/* Chat Input */
.chat-input {
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.messageInput {
  flex: 1;
  padding: 15px; /* Increase input padding */
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #4a4a6e; /* Input background color */
  color: #fff; /* Input text color */
  z-index: 10;
  margin-top: auto;
}

.messageInput::placeholder {
  color: #fff
}

#send {
  background-color: #86377b;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 15px 30px; /* Increase button padding */
  margin-left: 10px;
  cursor: pointer;
  z-index: 10;
}

#send:hover {
  background-color: #77306e;
}

/* CSS for chat messages */
.message-container {
display: flex;
flex-direction: column;
align-items: flex-start;
margin-bottom: 10px;
max-width: 70%;
}

/* CSS for your username */
.username {
  font-weight: bold; /* Make the username text bold */
  margin-right: 5px; /* Add some space between the username and the message */
}

#chatBox {
max-height: auto; /* Set a maximum height for the chat box */
overflow-y: auto; /* Add a vertical scrollbar if the chat box overflows */
}

.message-container {
display: flex;
flex-direction: column;
margin: 5px;
}

.user-name {
font-weight: bold;
}

.message-content {
margin-top: 5px;
}

/* Sidebar Styles */
.sidebar {
  width: 0; /* Adjust the width as needed */
  height: 100%;
  background-color: #1c1c2e; /* Sidebar background color */
  position: fixed; /* Keep the sidebar fixed on the screen */
  top: 0;
  left: 0;
  overflow-y: auto; /* Add vertical scrollbar if the content overflows */
  z-index: 3; /* Ensure the sidebar is on top of other elements */
  padding: 20px; /* Add padding for spacing */
  color: #fff; /* Text color */
}

.sidebar h2 {
  font-size: 18px; /* Adjust the heading font size */
  margin-top: 0; /* Remove top margin for headings */
}

/* Style for the "Create Group" button */
.create-group-button {
  background-color: #86377b;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  margin-bottom: 20px; /* Add spacing below the button */
}

.create-group-button:hover {
  background-color: #77306e;
}

/* Style for user-created and user-joined rooms lists */
.menu-segment ul {
  list-style: none;
  padding: 0;
}

.menu-segment li {
  margin-bottom: 10px;
}

/* ... Add more sidebar styles as needed ... */

.main-contnet {
  margin-left: 0;
  transition: margin-left 0.5s;
}

MAIN.JS
// const messageInput = document.getElementById("messageInput");
// const sendBtn = document.getElementById("send");
// const chatMessages = document.querySelector('.chat-messages');
// const roomName = document.getElementById('room-name');
// const userList = document.getElementById('users');
// const usersTotal = document.getElementById('users-total');

// let token = localStorage.getItem("Token");
// let decodedToken = parseJwt(token);
// let userName = decodedToken.name;

// //GET USERNAME AN ROOM FROM URL
// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);
// let room = urlParams.get("room");

// console.log("ROOM", room);

// const socket = io();


// //PARSE TOKEN 
// function parseJwt(token) {
//     var base64Url = token.split(".")[1];
//     var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     var jsonPayload = decodeURIComponent(
//       window
//         .atob(base64)
//         .split("")
//         .map(function (c) {
//           return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
//         })
//         .join("")
//     );
//     return JSON.parse(jsonPayload);
//   }

//   function showJoinMessage(userName) {
//     console.log(userName);
//     const p = document.createElement('p')
//     p.innerHTML = `${userName} has joined the chat`
    
   
//     chatMessages.appendChild(p)
    
//   }


// // DOM CONTENT
// document.addEventListener("DOMContentLoaded", async () => {

//     //SIDEBAR TOGGLE
//     const sidebarToggleButton = document.querySelector(".sidebar-toggle-button");
//     const sidebar = document.querySelector(".sidebar");
//     const mainContent = document.querySelector(".main-content");

//     sidebarToggleButton.addEventListener("click", function () {
//         if (sidebar.style.width === "0px" || !sidebar.style.width) {
//             // OPEN THE SIDEBAR
//             sidebar.style.width = "250px"; 
//             mainContent.style.marginLeft = "250px"; 
//             sidebarToggleButton.textContent = "Hide Sidebar"; 
//         } else {
//             // ClLOSE THE SIDEBAR
//             sidebar.style.width = "0";
//             mainContent.style.marginLeft = "0";
//             sidebarToggleButton.textContent = "Show Sidebar"; 
//         }
//     });

//     try {
//         const token = localStorage.getItem("Token");

//         if (!token) {
//             return (window.location.href = "/login.html");
//         }

//         outputRoomName();
//         outputUsers();
//         await fetchAndDisplayMsg();
//         displayGroups();
        

//         //LOAD AND DISPLAY MESSAGE FROM LOCAL STORAGE
//             const storedMessage = getMsgFromLocalStorage();
//             storedMessage.forEach((message) => {
//                 console.log(message);
//         });
//     } catch (err) {
//         console.log("NO TOKEN FOUND", err);
//     }
// });

// // FETCH MESSAGE FROM DB

// async function fetchAndDisplayMsg() {
//     try {
//         const token = localStorage.getItem("Token");

//         const response = await axios.get(`/messages?room=${room}`, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         });

//         const newMessages = response.data.allMessages;

//     } catch (err) {
//         console.log("ERROR IN FETCHING MESSAGE", err);
//     }
// }

// // SAVE TO DB
// async function saveToDB(message) {

//     const data = {
//         name : userName,
//         message: message,
//         dateTime: new Date()
//     };

//     try {
//         const token = localStorage.getItem("Token");

//         const response = await axios.post("/sendMessage", data, {
//             headers: {
//                 Authorization: `${token}`,
//             },
//         });

//         socket.emit('message', message);
//         messageInput.value = "";
//         messageInput.focus();

//     } catch (err) {
//         alert("ERROR IN SAVING MESSAGE TO DB");
//         console.log(err);
//     }
// }

// function scrollToBottom() {
//     chatMessages.scrollTo(0, chatMessages.scrollHeight)
// }

//   //EVENT LISTENER SEND BUTTON
//   sendBtn.addEventListener("click", function () {
//     const msg = messageInput.value.trim();

//     //EMIT MSG TO SERVER
//     if (msg !== "") {
//         saveToDB(msg);
//         saveMsgToLocalStorage(msg);
//     }

// });


// //ADD ROOM NAME 
// function outputRoomName() {
//     console.log("ROOM", room);
//     roomName.innerText = `${room}`;
// }

// //ADD USERS 
// function outputUsers(users) {
//     userList.innerHTML = '';
//     users.forEach((user) => {
//         const li = document.createElement('li');
//         li.innerText = user.username;
//         userList.appendChild(li);
//     });
// }

// //LEAVE CHAT ROOM
// document.getElementById('leave-button').addEventListener('click', () => {
//     const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
//     if(leaveRoom) {
//         socket.emit('leave', userName);
//        window.location.href = "/home.html";
//     } else {
//         return false;
//     }
// });

// //GET MESSAGE FROM LOCAL STORAGE
// function getMsgFromLocalStorage() {
//     const storedMessage = localStorage.getItem(`chatMessages_${room}`);
//     return storedMessage ? JSON.parse(storedMessage) : [];
// }

// //SAVE MESSAGE TO LOCAL STORAGE
// function saveMsgToLocalStorage(msg) {
//     const storedMessage = getMsgFromLocalStorage();
//     storedMessage.push(msg);

//     if(storedMessage.length > 10) {
//         storedMessage.shift();
//     }
//     localStorage.setItem(`chatMessages_${room}`, JSON.stringify(storedMessage));
// }

// async function fetchGroups() {
//     try {
//         const response = await axios.get("/groups");
//         if(response.status === 200) {
//             const groups = response.data;
//             return groups.rooms;
//         }
//         return [];
//     } catch (err) {
//         console.log(err);
//     }
// }

// async function displayGroups() {
//     const sidebar = document.querySelector(".room-list ul#userRooms");
//     const allGroups = await fetchGroups();

//     if(allGroups.length > 0) {
//         sidebar.innerHTML = "";

//         allGroups.forEach((group) => {
//             const listItem = document.createElement("li");
//             listItem.textContent = group.name;
//             listItem.classList.add("clickable-item");
//             listItem.dataset.roomId = group.name;

//             listItem.addEventListener("click", function() {
//                 switchToRoom(listItem.dataset.roomId);
//             });
//             sidebar.appendChild(listItem);
//         });
//     } else {
//         console.log("err");
//     }
// }

// function switchToRoom(roomId) {
//     alert(`SWITCHING TO ROOM ${room}` );
//     alert(roomId);
//     const roomUrl = `/main.html?room=${roomId}`;
//     window.location.href = roomUrl;
// }

