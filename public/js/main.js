const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send");
const chatBox = document.getElementById("chatBox");
const groupId = getGroupIdFromQueryString();

let token = localStorage.getItem("Token");
let decodedToken = parseJwt(token);
let userName = decodedToken.name;


const socket = io();

// SIDEBAR EVENT LISTENER
const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menu-button");

menuButton.addEventListener("click", () => {
    menuButton.classList.toggle("active");
    sidebar.classList.toggle("active");
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

  //GET GROUP ID
  function getGroupIdFromQueryString() {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get("groupId");
  }

  //EVENT LISTENER SEND BUTTON
  sendBtn.addEventListener("click", function () {
    const message = messageInput.value.trim();
    append(`You: ${message}`, 'right', null);
    socket.emit('sendMessage', message);
    if (message !== "") {
        saveToDB(message);
    }
});

//APPEND
const append = (message, position, userName) => {
    const messageElement = document.createElement("div");
    if(userName === null) {
        messageElement.innerText = message;
    } else {
    messageElement.innerText = `${userName} : ${message}`;
    }
    messageElement.classList.add('message')
    messageElement.classList.add(position);
    chatBox.append(messageElement);
}

// DOM CONTENT
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = localStorage.getItem("Token");
        console.log(token);

        if (!token) {
            return (window.location.href = "/login.html");
        }

        const userJoinedFlag = localStorage.getItem("userJoinedFlag");

        if(!userJoinedFlag) {
            append(`${userName} joined the chat`, 'right', null);

            localStorage.setItem("userJoinedFlag", "true");
        }
        
        socket.emit('new-user-joined', userName);

        socket.on('user-joined', joinedUserName => {
            if(joinedUserName === userName) {
                append("You joined the chat", 'center', null)
            } else {
                append(`${userName} joined the chat`, 'center', null)
            }
        });

        socket.on('receivedMessage', data => {
            append(`${data.userName} : ${data.message}`, 'left', null)
        });

        socket.on('left', userName => {
            append(`${userName} left the chat`, 'right', null)
        });

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

        //RETRIEVE MESSAGES FROM LOCAL STORAGE
        const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];

        const combinedMessages = [...storedMessages, ...newMessages];
        const uniqueMessages = combinedMessages.filter((message, index, self) => 
            index === self.findIndex((m) => m.id === message.id)
        );

        uniqueMessages.slice(-10);

        localStorage.setItem("chatMessages", JSON.stringify(uniqueMessages));

        uniqueMessages.forEach((messageObj) => {
            const messageText = messageObj.message;
            const senderName = messageObj.name;

            if(senderName === userName) {
                append(messageText, 'right', "You");
            } else {
                 append(messageText, 'left', senderName);
            }
           
        });

    } catch (err) {
        console.log("ERROR IN FETCHING MESSAGE", err);
    }
}

// SAVE TO DB
async function saveToDB(message) {

    if (message === "User joined the chat") {
        message = `${userName} joined the chat`;
    }

    const data = {
        message: message,
        groupId : groupId,
    };

    try {
        const token = localStorage.getItem("Token");

        const response = await axios.post("/sendMessage", data, {
            headers: {
                Authorization: `${token}`,
            },
        });

        messageInput.value = "";

    } catch (err) {
        alert("ERROR IN SAVING MESSAGE TO DB");
        console.log(err);
    }
}
