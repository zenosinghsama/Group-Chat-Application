const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send");
const chatBox = document.getElementById("chatBox");
const groupDropDown = document.getElementById("groupDropDown");

let token = localStorage.getItem("Token");
let decodedToken = parseJwt(token);
let userName = decodedToken.name;
let selectedGroup = null;

// DOM CONTENT
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = localStorage.getItem("Token");

        if (!token) {
            return (window.location.href = "/login.html");
        }

        const joinMessage = `${userName} joined the chat`;
        showMessageOnScreen(joinMessage);

        await fetchAndDisplayMsg();
    } catch (err) {
        console.log("NO TOKEN FOUND", err);
    }
});


// FETCH MESSAGE FROM DB
async function fetchAndDisplayMsg() {
    try {
        const token = localStorage.getItem("Token");

        const response = await axios.get("/messages", {
            headers: {
                Authorization: `${token}`,
            },
        });

        const newMessages = response.data.allMessages;

        newMessages.forEach((messageObj) => {
            const senderName = messageObj.name;
            console.log("SENDER NAME ",senderName);
            const messageText = messageObj.message;
            const isSentByCurrentUser =
                messageObj.userId === localStorage.getItem("ID");
            showMessageOnScreen(senderName, messageText, isSentByCurrentUser);
        });
    } catch (err) {
        console.log("ERROR IN FETCHING MESSAGE", err);
    }
}


// SHOW MSG ON SCREEN
function showMessageOnScreen(senderName, message, messageType ,isSentByCurrentUser) {
    const messageContainer = document.createElement("div");
    messageContainer.className = "message";

    const messageText = document.createElement("div");
    messageText.textContent = message;

    const messageBubble = document.createElement("div");
    messageBubble.textContent = message;

    if(messageType === "join") {
        const joinMessage = document.createElement("div");
        joinMessage.className = "join-message";
        joinMessage.textContent = `${senderName} joined the chat`

        messageContainer.appendChild(joinMessage);
    } else {

        if (isSentByCurrentUser) {
        const userNameSpan = document.createElement("span");
        userNameSpan.className = "username current-user";
        userNameSpan.textContent = userName;

        messageContainer.appendChild(userNameSpan);
    } else {
        const senderUserName = document.createElement("div");
        senderUserName.className = "username";
        senderUserName.textContent = senderName;

        messageContainer.appendChild(senderUserName);
    }
    }
    messageContainer.appendChild(messageText);
    chatBox.appendChild(messageContainer);
}

// SAVE TO DB
async function saveToDB(message) {

    if (message === "User joined the chat") {
        message = `${userName} joined the chat`;
    }

    const data = {
        message: message
    };

    try {
        const token = localStorage.getItem("Token");

        const response = await axios.post("/sendMessage", data, {
            headers: {
                Authorization: `${token}`,
            },
        });

        messageInput.value = "";

        const newMessage = response.data.newAddedMessage.message;
        const name = response.data.newAddedMessage.name;
  
        showMessageOnScreen(name, newMessage, true);
    } catch (err) {
        alert("ERROR IN SAVING MESSAGE TO DB");
        console.log(err);
    }
}

async function joinChat() {
    try {
        const joinMessage = `${userName} joined the chat`;

        await saveToDB(joinMessage, "join");
    } catch(err) {
        console.log("ERROR JOINING CHAT", err);
    }
}

sendBtn.addEventListener("click", function () {
    const message = messageInput.value.trim();
    if (message !== "") {
        saveToDB(message, "message");
    }
});

//PARSE TOKEN 
function parseJwt(token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  }