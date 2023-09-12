const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send");
const chatMsg = document.getElementById("chat-messages");

document.addEventListener("DOMContentLoaded", async() => {
    try {
        const token = localStorage.getItem("Token");

        if(!token) {
            return (window.location.href = "/login.html");     
        }

        const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
        const recentMessages = storedMessages.slice(-MaxChatMsg);

        recentMessages.forEach((messageObj) => {
            const messageText = messageObj.message;
            const isSentByCurrentUser = messageObj.userId === localStorage.getItem("ID");
            showMessageOnScreen(messageText, isSentByCurrentUser);
        });

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

        const newMessages = response.data.allMessages.filter((messageObj) => {
            return !isMessageInLocalStorage(messageObj);
        });

        newMessages.forEach((messageObj) => {
            const messageText = messageObj.message;
            const isSentByCurrentUser = messageObj.userId === localStorage.getItem("ID");
            showMessageOnScreen(messageText, isSentByCurrentUser);

            addToLocalStorage(messageObj);
        }) ;
    } catch (err) {
        console.log("ERROR IN FETCHING MESSAGE", err);
    }
}

async function fetchAndDisplayNewMsg() {
    try {
        // ...

        newMessages.forEach((messageObj) => {
            const messageText = messageObj.message;
            const isSentByCurrentUser = messageObj.userId === localStorage.getItem("ID");
            showMessageOnScreen(messageText, isSentByCurrentUser);

            // Add the new message to local storage
            addToLocalStorage(messageObj);
        });
    } catch (err) {
        console.log("ERROR IN FETCHING MESSAGE", err);
    }
}

// setInterval(fetchAndDisplayMsg, 1000);
const MaxChatMsg = 10;
function isMessageInLocalStorage(messageObj) {
    const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];

    if(storedMessages.length >= MaxChatMsg) {
        storedMessages.shift();
    }

    storedMessages.push(messageObj);
    localStorage.setItem("chatMessages", JSON.stringify(storedMessages));
}

function addToLocalStorage(messageObj) {
    const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    storedMessages.push(messageObj);
    localStorage.setItem("chatMessages", JSON.stringify(storedMessages));
}

//SHOW MSG ON SCREEN
function showMessageOnScreen(message, isSentByCurrentUser) {
    const username = localStorage.getItem("name");
    const chatBox = document.getElementById("chatBox");
    const messageContainer = document.createElement("div");
    messageContainer.className =  isSentByCurrentUser ? "message sent" : "message received";

    const userNameSpan = document.createElement("span");
    userNameSpan.className = "username";
    userNameSpan.textContent = username;

    const messageBubble = document.createElement("div");
    messageBubble.textContent = message;

    messageContainer.appendChild(userNameSpan);
    messageContainer.appendChild(messageBubble);

    chatBox.appendChild(messageContainer);
}

 //SAVE TO DB
 async function saveToDB(message) {

    const data = {
        message : message
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
        showMessageOnScreen(newMessage, true);

        addToLocalStorage(response.data.newAddedMessage);
        
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


