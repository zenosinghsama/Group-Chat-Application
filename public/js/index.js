const baseUrl = 'http://localhost:5000';
const token = localStorage.getItem("Token");
const decodedToken = parseJwt(token);
const headers = { headers: { Authorization: `Bearer ${token}` } };

let currentGroup = null;

const userName = decodedToken.name;
console.log("USER TOKEN", token)

window.addEventListener("DOMContentLoaded", async () => {

    try {
        displayGroups();
        displayUsers();

        //TOGGLE SIDEBAR
        const sidebarToggle = document.getElementById("sidebar-toggle");
        const sidebar = document.getElementById("sidebar");

        sidebarToggle.addEventListener("click", () => {
            if (sidebar.style.left === "-300px") {
                sidebar.style.left = "0";
            } else {
                sidebar.style.left = "-300px";
            }
        });
    } catch(err) {
        console.log(err);
    }
        
});

//CREATE NEW GROUP
async function createGroup(event) {
    event.preventDefault();
    const newGroupName = document.getElementById('newGroupName').value;

    try {

        const response = await axios.post(`${baseUrl}/groups/create`, {
            name: newGroupName,
            adminId: await getUserId(),
        }, headers );

        if (response.status === 201) {
            alert("GROUP CREATED", newGroupName);
            const groupId = response.data.newGroup.id;

            // window.location.href = `/group-chat.html`
            displayGroups();
        } else {
            console.log("GROUP NOT CREATED DUE TO ERROR");
        }

    } catch (err) {
        console.log(err.response.status, "ERROR IN CREATING GROUP");
    }
}


//SEND CHAT MESSAGE
async function sendMessage(event) {
    event.preventDefault();
    const newMessage = document.getElementById('newMessage').value;
    const username = decodedToken.name;
    console.log(newMessage);

    try {
        console.log(username);
        const response = await axios.post(`${baseUrl}/chats/send`, {
            message: newMessage,
            username: username,
            senderId: await getUserId(),
            groupId: getCurrentGroup().id,
        }, headers);

        console.log('MESSAGE SENT', response.data);

        updateChatBox(getCurrentGroup().id);
    } catch (err) {
        console.log(err.response.data, "ERROR IN SENDING MESSAGE")
    }
}

//DISPLAY GROUPS
async function displayGroups() {
 
    try {
        const response = await axios.get(`${baseUrl}/groups/user`, headers);

        const userGroups = response.data.groups;

        const groupContainer = document.getElementById('chat-rooms');
        groupContainer.innerHTML = '';

        if (!userGroups || userGroups.length === 0) {
            const grpMsg = document.createElement('p');
            grpMsg.textContent = "No Groups Yet";
            groupContainer.appendChild(grpMsg);
        } else {
            userGroups.forEach(group => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'group-div';
                const groupName = document.createElement('h6');
                groupName.textContent = group.groupName;

                groupName.addEventListener('click', () => {
                    setCurrentGroup(group);
                    updateChatBox(group.id);
                });

                groupDiv.appendChild(groupName);
                groupContainer.appendChild(groupDiv);
            })
        }
    } catch (err) {
        console.log(err, "ERROR IN DISPLAYING USER GROUPS");
    }
}

//OPEN CHAT BOX FOR GROUP
async function updateChatBox(groupId) {
    try {
        const response = await axios.get(`${baseUrl}/chats/groups/${groupId}/history`);
        const chatMessages = response.data.chatHistory;

        const chatMessagesContainer = document.getElementById('chat-messages');
        chatMessagesContainer.innerHTML = '';

        if (chatMessages.length === 0) {
            const noMessages = document.createElement('p');
            noMessages.textContent = 'No chat history yet.';
            chatMessagesContainer.appendChild(noMessages);
        } else {
            chatMessages.forEach(message => {
                const messageDiv = document.createElement('div');
                console.log(message);
                messageDiv.textContent = `${message.username}: ${message.message}`;
                chatMessagesContainer.appendChild(messageDiv);
            });
        }
    } catch (err) {
        console.error(err, 'Error updating chat box');
    }
}

async function displayUsers() {
    try {
        const response = await axios.get("/users", { headers });

        const userList = response.data.users;

        const userContainer = document.getElementById('user-list');
        userContainer.innerHTML = "";

        userList.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-div';
            const userName = document.createElement('h6');
            userName.textContent = user.username;
            userDiv.appendChild(userName);

            userContainer.appendChild(userDiv);
        });
    } catch (err) {
        console.log(err, "ERROR IN DISPLAYING USERS");
    }
}

// FETCH AND DISPLAY USERS IN MODAL
async function displayUsersInModal() {
    try {
        const response = await axios.get('/users');
        const userList = response.data.users;

        const userListElement = document.getElementById('usersList');
        userListElement.innerHTML = '';

        userList.forEach(user => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');

            // CREATE A CHECKBOX
            const checkboxInput = document.createElement('input');
            checkboxInput.type = 'checkbox';
            listItem.appendChild(checkboxInput);

            // DISPLAY USERNAME NEXT TO CHECKBOX
            const usernameSpan = document.createElement('span');
            usernameSpan.style.marginLeft = '10px'
            usernameSpan.innerText = user.username;
            usernameSpan.id = user.id;
            listItem.appendChild(usernameSpan);

            userListElement.appendChild(listItem);
        });

    } catch (err) {
        console.error(err, 'ERROR FETCHING USERS');
    }
}

// ADD USERS TO SELECTED GROUP
async function addUsersToSelectedGroup(event) {
    event.preventDefault();

    //GET SELECTED USERS
    const selectedUsers = Array.from(document.querySelectorAll('#usersList input:checked'))
        .map(checkboxInput => checkboxInput.value);

    if (!selectedUsers || selectedUsers.length === 0) {
        return alert("PLEASE SELECT AT LEAST ONE USER")
    }

    try {
        const groupId = getCurrentGroup().id;
        const response = await axios.get(`/groups/${groupId}/users`, {
            data: { users: selectedUsers },
        });

        
    } catch (err) {
        console.log(err, "ERROR ADDING USERS TO GROUP");
    }
}

async function addUsersToNewGroup(event) {
    event.preventDefault();

    // GET USERS
    console.log(document.querySelectorAll('#usersList input:checked'))
    const selectedUsers = Array.from(document.querySelectorAll('#usersList input:checked'))
        .map(checkboxInput => checkboxInput.nextSibling.id);

    //GET GROUP NAME
    const newGroupName = document.getElementById('newGroupNameModal').value;
    console.log("GROUP NAME:" ,newGroupName);

    try {
        console.log(newGroupName, selectedUsers, getUserId())
        const response = await axios.post(`${baseUrl}/groups/create`, {
            name: newGroupName,
            adminId: await getUserId(),
            users: selectedUsers,
        }, { headers });

        console.log(response);

        if (response.status === 201) {
            alert("Group created and users added successfully.");
            displayGroups();
        } else {
            alert("GROUP NOT CREATED DUE TO ERROR");
        }
    } catch (err) {
        console.error(err, 'ERROR CREATING GROUPS');
    }
}

//LOGOUT
function logout() {
    localStorage.removeItem('Token');
    window.location.href = "/login.html";
}

//GET USER ID
async function getUserId() {
    const id = localStorage.getItem("ID");
    return id;
}

function setCurrentGroup(group) {
    currentGroup = group;
    console.log(group, "GROUP");
}

function getCurrentGroup() {
    return currentGroup;
}

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