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