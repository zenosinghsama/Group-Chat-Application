const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send");
const chatMsg = document.getElementById("chat-message");


document.addEventListener("DOMContentLoaded", async() => {
    
    try {
        const token = localStorage.getItem("token");
        const decodedToken = parseJwt(token);

        if(!token) {
            return (window.location.href = "/view/login.html");
        }
    } catch(err) {
        console.log("NO TOKEN FOUND", err);
    }
});

 //SAVE TO DB
 async function saveToDB(message) {

    const data = {
        message : message
    };

    console.log(data, "MESSAGE");
    try {
        const token = localStorage.getItem("token");
        
        console.log("TOken" , token);

        const response = await axios.post("/sendMessage", data, {
            headers: {
                Authorization : token,
            }
        });

        alert("MESSAGE SAVED TO DB");

        messageInput.value = "";

        showMessageOnScreen(response.data.newMessage);
        
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

//JWT TOKEN PARSER
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