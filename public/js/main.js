const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send");
const chatMsg = document.getElementById("chat-messages");

document.addEventListener("DOMContentLoaded", async() => {
    try {
        const token = localStorage.getItem("Token");

        if(!token) {
            return (window.location.href = "/login.html");     
        }

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

        const messages = response.data.allMessages;
        console.log(messages);

        chatBox.innerHTML = "";

        messages.forEach((messageObj) => {
            const messageText = messageObj.message;
            console.log(messageText)
            showMessageOnScreen(messageText);
        }) ;
    } catch (err) {
        console.log("ERROR IN FETCHING MESSAGE", err);
    }
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

        let newMessage = response.data.newAddedMessage.message;

        showMessageOnScreen(newMessage, true);
        console.log(response.data.newAddedMessage)
        
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


