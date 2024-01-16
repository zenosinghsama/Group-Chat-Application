const baseUrl = 'http://localhost:5000';
const token = localStorage.getItem("Token");
const userId = localStorage.getItem("ID");
const decodedToken = parseJwt(token);
const headers = { headers: { Authorization: `Bearer ${token}` } };

let currentGroup = { id: null, name: 'HomePage' };
const messageHistory = {};

const userName = decodedToken.name;
const usersOnline = document.getElementById('clients-total');
const messageContainer = document.getElementById('chatBox-container');
const notificationBar = document.getElementById('notification-bar');
const unreadCountEle = document.getElementById('notification-unread-count');

//SOCKET IO CONNECTIONS
const socket = io(baseUrl);
let isSocketConnected = false;

const append = (messageObj) => {
    try {
        // console.log(messageObj, "APPEND");
        const currentUserId = userId;
        const style = (messageObj.senderId === currentUserId) ? 'right' : 'left';

        const currentGroup = getCurrentGroup().id;
        const groupId = currentGroup;
        // console.log("GROUP ID IS", groupId, currentGroup)

        if (groupId === null) {
            // console.log(messageObj, "GROUP ID IS NULL");
            appendNotificationToHomepage(messageObj);
        }

        if (!messageHistory[groupId]) {
            messageHistory[groupId] = [];
        }

        messageHistory[groupId].push(messageObj);

        // console.log(messageHistory);

        // console.log("APPENDING MESSAGE THEN LS SAVE", groupId);
        saveMessagesToLocalStorage(groupId);

        const messageElement = document.createElement('div');
        if(messageObj.username === '') {
            messageElement.textContent = `${messageObj.message}`;
        } else {
            messageElement.textContent = `${messageObj.username}: ${messageObj.message}`;
        }   

        if (messageObj.isReadByAll) {
            messageElement.innerHTML += ' &#10004;&#10004;';
        }

        messageElement.classList.add(`message`, style);

        if (style === 'right') {
            messageElement.classList.add('message-right');
        } else if ( messageObj.style === 'center' ){
           messageElement.classList.add('message', 'center');
        } else{
            messageElement.classList.add('message-left');
        }

        messageContainer.append(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    } catch (error) {
        console.error('Error in append function:', error);
    }
};

socket.on('connect', () => {
    console.log('CONNECTED SOCKET');
    isSocketConnected = true
});

socket.on('user-joined', ({ groupId, username }) => {
        append({
            username: 'SYSTEM',
            message: `${username} joined the group`,
            senderId: 'SYSTEM',
        });
        adjustChatBoxHeight();
})

socket.on('message-received', (data) => {
    //APPEND MSG TO UI
    append({
        username: data.username,
        message: data.message,
        senderId: data.senderId,
        isReadByAll: data.isReadByAll,
    }, 'right');

    //READ THE MESSAGE EVENT
    socket.emit('read-message', {
        groupId: getCurrentGroup().id,
        userId: userId,
        senderId: data.senderId,
        message: data.message,
        username: data.username,
    });
    adjustChatBoxHeight();
});

socket.on('receive-invite', (data) => {
    const { senderUsername, inviteLink } = data;

    const inviteNotification = document.createElement('div');
    inviteNotification.textContent = `${senderUsername} invited you to join ${inviteLink}`;
    notificationBar.appendChild(inviteNotification);

})

socket.on('update-read-status', (data) => {
    console.log('READ STATUS UPDATED', data);
});

socket.on('user-added-to-group', (data) => {
    console.log("USER ADDED", data);
    append({ username: '', message: data, style: 'center'})
})

socket.on('disconnect', () => {
    // console.log('DISCONNECTED SOCKET');
    isSocketConnected = false;
});

function joinRoom(groupId, userName) {
    socket.emit('join-room', groupId, userName);
}

window.addEventListener("DOMContentLoaded", async () => {

    try {
        const groupId = getCurrentGroup().id;

        const displayUserName = document.getElementById("user-name")
        displayUserName.textContent = userName;

        displayGroups();
        displayUsers();
        sideBarEvent();
        hideChatSection();
        displayProfileImage();

        const currentGroup = getCurrentGroup();
        if (currentGroup) {
            // console.log(currentGroup);
            joinRoom(currentGroup.id, userName);
        }
    } catch (err) {
        console.log(err);
    }

});

//TOGGLE SIDEBAR
function sideBarEvent() {
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("sidebar");

    const homePage = document.getElementById("homePage");

    homePage.addEventListener('click', () => {
        window.location.href = '/home.html'
    })


    sidebarToggle.addEventListener('click', function (event) {
        event.stopPropagation();
        sidebar.classList.toggle('open');
    });

    document.addEventListener('click', function (event) {
        if (!sidebar.contains(event.target) && event.target !== sidebarToggle) {
            sidebar.classList.remove('open');
        }
    });
}

function adjustChatBoxHeight() {
    var chatBoxHeight = document.getElementById('chatBox-container');
    chatBoxHeight.scrollTop = chatBoxHeight.scrollHeight;
}

//CREATE NEW GROUP
async function createGroup(event) {
    event.preventDefault();
    const newGroupName = document.getElementById('newGroupName').value;
    const groupImageInput = document.getElementById('groupImageInput');
    const groupImage = groupImageInput.files[0];

    // console.log("Group Name:", newGroupName);
    // console.log("Group Image:", groupImage);
    // console.log("Selected Users:", selectedUsers);

    try {
        const formData = new FormData();
        formData.append('name', newGroupName);
        formData.append('adminId', await getUserId());
        formData.append('groupImage', groupImage);


        const response = await axios.post(`${baseUrl}/groups/create`, formData, {
            headers: {
                ...headers,
                'Content-Type': 'multipart/form/data',
            }
        });

        if (response.status === 201) {
            alert("GROUP CREATED", newGroupName);
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
    const senderId = await getUserId();
    const groupId = getCurrentGroup().id;

    try {
        const isSender = senderId === (await getUserId()).toString();
        const style = isSender ? 'right' : 'left';

        const messageData = {
            username, message: newMessage, style,
        }

        const response = await axios.post(`${baseUrl}/chats/send`, {
            message: newMessage,
            username: username,
            senderId: await getUserId(),
            groupId: groupId,
            style: style,
        }, headers);

        //SOCKET EMIT
        socket.emit('new-message', {
            groupId: groupId,
            messageId: response.data.id,
            senderId: senderId,
            senderSocketId: socket.id,
            message: newMessage,
            username: username,
            style: style,
            isReadByAll: false,
        });

        socket.emit('send-notification', {
            groupId: groupId,
            message: newMessage,
            senderId: senderId,
            username: username,
            isReadByAll: false,
        })

        adjustChatBoxHeight();
        const chatMessagesObject = response.data.chatMessage

        // Clear the input field after sending the message
        document.getElementById('newMessage').value = '';


        // console.log(chatMessagesObject, "AFTER SENDING MESSAGE")


    } catch (err) {
        console.log(err, "ERROR IN SENDING MESSAGE")
    }
}

// SAVE MESSAGES TO LOCAL STORAGE
function saveMessagesToLocalStorage(groupId) {
    try {
        const existingMessages = JSON.parse(localStorage.getItem(`messages_${groupId}`)) || [];

        const currentGroupMessages = messageHistory[groupId] || [];
        const newMessages = currentGroupMessages.slice(-10);

        const newMessagesData = newMessages.map(msg => ({
            username: msg.username,
            message: msg.message,
            senderId: msg.senderId,
        }));


        const mergedMessagesData = [...existingMessages, ...newMessagesData];

        const uniqueMessagesData = Array.from(new Set(mergedMessagesData.map(JSON.stringify)), JSON.parse);

        localStorage.setItem(`messages_${groupId}`, JSON.stringify(uniqueMessagesData));
        
        const slicedMessages = uniqueMessagesData.slice(-10);

        localStorage.setItem(`messages_${groupId}`, JSON.stringify(slicedMessages));

    } catch (error) {
        console.error('Error saving messages to local storage:', error);
    }
}

// LOAD MESSAGE FROM LOCAL STORAGE
function loadMessagesFromLocalStorage(groupId) {
    try {
        const storedMessages = JSON.parse(localStorage.getItem(`messages_${groupId}`)) || [];

        const loadedMessages = storedMessages.map(msg => ({
            username: msg.username,
            message: msg.message,
            senderId: msg.senderId,
            style: (msg.senderId === userId) ? 'right' : 'left'
        }));

        return loadedMessages;
    } catch (error) {
        console.error('Error loading messages from local storage:', error);
        return [];
    }
}

async function updateChatHeading(groupName) {
    const chatHeading = document.getElementById('chat-heading');
    chatHeading.innerHTML = ''; // Clear existing content

    // Display group name in the heading
    const groupNameSpan = document.createElement('span');
    groupNameSpan.textContent = groupName;

    // Display group image next to the group name
    const groupId = getCurrentGroup().id;
    const groupImage = await displayGroupImage(groupId);

    // console.log(groupImage);

    if (groupImage) {
        const imageElement = document.createElement('img');
        imageElement.src = groupImage;
        imageElement.alt = 'Group Image';
        imageElement.classList.add('group-image');
        chatHeading.appendChild(imageElement);
    }

    chatHeading.appendChild(groupNameSpan);
}

function hideChatSection() {
    document.getElementById('chat-section').style.display = 'none';
    document.getElementById('notification-bar').style.display = 'block';
}

//OPEN CHAT BOX FOR GROUP
async function updateChatBox(groupId) {
    try {
        // console.log(currentGroup);
        const welcomeSection = document.getElementById('welcome-section');
        if (welcomeSection && currentGroup.id !== null) {
            welcomeSection.style.display = 'none';
        }
        const chatMessagesContainer = document.getElementById('chatBox-container');
        chatMessagesContainer.innerHTML = '';

        messageHistory[groupId] = loadMessagesFromLocalStorage(groupId);

        messageHistory[groupId].forEach(messageObj => {
            append(messageObj);
        });

        const chatSectionContainer = document.getElementById('chat-section');
        chatSectionContainer.style.display = 'block';

        const groupHeading = document.getElementById('chat-heading');
        groupHeading.addEventListener('click', () => {
            showGroupDetails();
        })

    } catch (err) {
        console.error(err, 'ERROR UPDATING CHAT BOX');
    }
}

//DISPLAY GROUPS
async function displayGroups() {

    try {
        const response = await axios.get(`${baseUrl}/groups/user`, headers);

        const userGroups = response.data.groups;

        const groupContainer = document.getElementById('chat-rooms');
        groupContainer.innerHTML = '';

        const recentGroupContainer = document.getElementById('recentGroupsContainer');
        recentGroupContainer.innerHTML = '<h3>RECENT CHATSs';

        if (!userGroups || userGroups.length === 0) {
            const grpMsg = document.createElement('p');
            grpMsg.textContent = "NO GROUPS YET";
            groupContainer.appendChild(grpMsg);

        } else {
            userGroups.forEach(group => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'group-div';

                const groupNameSpan = document.createElement('span');
                groupNameSpan.textContent = group.groupName;

                const handleGroupClick = () => {
                    setCurrentGroup(group);
                    updateChatBox(group.id);
                    updateChatHeading(group.groupName);
                    displayGroupImage(group.id);

                    //CHECK ADMIN
                    if (userId === group.adminId.toString()) {
                        // console.log("USER ID AND ADMIN ID", group.adminId, userId)
                        const editBtn = document.createElement('button');
                        editBtn.classList.add('btn', 'btn-primary', 'float-right')
                        editBtn.textContent = 'Edit Group';
                        editBtn.addEventListener('click', () => editGroup(group));

                        const chatHeadingEle = document.getElementById('chat-heading');
                        if (chatHeadingEle) {
                            chatHeadingEle.appendChild(editBtn);
                        }
                    }
                };

                groupNameSpan.addEventListener('click', handleGroupClick);
                groupDiv.appendChild(groupNameSpan);
                groupContainer.appendChild(groupDiv);

                const recentGroupDiv = groupDiv.cloneNode(true);
                recentGroupDiv.classList.add('recent-group-div');
                recentGroupDiv.addEventListener('click', handleGroupClick);
                recentGroupContainer.appendChild(recentGroupDiv);
            })
        }
    } catch (err) {
        console.log(err, "ERROR IN DISPLAYING USER GROUPS");
    }
}
//DISPLAY USERS
async function displayUsers() {
    try {
        const response = await axios.get("/users", { headers });

        const userList = response.data.users;

        const userContainer = document.getElementById('user-list');
        userContainer.innerHTML = "";

        const allUserContainer = document.getElementById('userDivContainer');
        allUserContainer.innerHTML = "<h3>USERS</h3>";

        userList.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-div';
            const userName = document.createElement('h6');
            userName.textContent = user.username;
            userDiv.appendChild(userName);

            userContainer.appendChild(userDiv);

            const recentUserDiv = userDiv.cloneNode(true);
            recentUserDiv.classList.add('recent-allUser-div');
            allUserContainer.appendChild(recentUserDiv);

        });
    } catch (err) {
        console.log(err, "ERROR IN DISPLAYING USERS");
    }
}

//DISPLAY PROFILE IMAGE
async function displayProfileImage() {
    try {
        const response = await axios.get('/users', { headers });
        // console.log("DATA", response.data.users);

        const userList = response.data.users;
        const profileImageDiv = document.getElementById('user-profile-image');

        profileImageDiv.innerHTML = '';

        userList.forEach(user => {

            if (user.image) {
                // console.log('Image URL:', user.image);
                const userDiv = document.createElement('div');
                const imgElement = document.createElement('img');
                imgElement.src = user.image;
                imgElement.alt = 'Profile Image';

                // Append the imgElement to the profileImageDiv
                userDiv.appendChild(imgElement);

                const editBtn = document.createElement('button');
                editBtn.innerHTML = '<i class="fa-solid fa-pen-fancy"></i>';

                editBtn.addEventListener('click', () => {
                    editProfile(user.id);
                });

                userDiv.appendChild(editBtn);

                userDiv.addEventListener('mouseenter', () => {
                    editBtn.style.display = 'block';
                });

                userDiv.addEventListener('mouseleave', () => {
                    editBtn.style.display = 'none';
                });

                profileImageDiv.appendChild(userDiv);
            }
        });

    } catch (err) {
        console.error("Error in displaying profile image: ", err);
    }
}

//DISPLAY GROUP IMAGE
async function displayGroupImage(groupId) {
    try {
        const response = await axios.get(`/groups/${groupId}/users`, headers);
        // console.log("GROUP ID FOR IMAGE", groupId);

        const imageUrl = response.data.group.groupImage;
        // console.log(imageUrl);

        return imageUrl;

    } catch (err) {
        console.error("Error in getting Group Details for Image Display : ", err);
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
            checkboxInput.value = user.username;
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

function closeUserModal() {
    const modal = document.getElementById('addUsersModal');
    modal.remove();
}

//ADD USERS TO NEW GROUP
async function addUsersToNewGroup(event) {
    event.preventDefault();

    // GET USERS
    console.log(document.querySelectorAll('#usersList input:checked'))
    const selectedUsers = Array.from(document.querySelectorAll('#usersList input:checked'))
        .map(checkboxInput => checkboxInput.nextSibling.id);

    //GET GROUP NAME
    const newGroupName = document.getElementById('newGroupNameModal').value;
    const groupImageInput = document.getElementById('groupImageInput');
    const groupImage = groupImageInput.files[0];

    try {
        const formData = new FormData();

        formData.append('name', newGroupName);
        formData.append('adminId', await getUserId());
        formData.append('groupImage', groupImage);
        formData.append('selectedUsers', JSON.stringify(selectedUsers));

        const response = await axios.post(`${baseUrl}/groups/create`, formData, {
            headers: {
                ...headers,
                'Content-Type': 'multipart/form-data',
            }
        });

        const groupImageHead = response.data.newGroup.groupImageUrl;
        console.log(groupImageHead);


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
//SHOW GROUP DETAILS
function showGroupDetails() {
    const currentGroup = getCurrentGroup();
    if (currentGroup) {
        document.getElementById('groupDetailsGroupName').textContent = `Group Name: ${currentGroup.groupName}`;

        displayUsersInGroup(currentGroup.id);
        displayGroupImage(currentGroup.id);

        const isAdmin = userId === currentGroup.adminId.toString();

        if (isAdmin) {
            const addUsersBtn = document.createElement('button');
            addUsersBtn.classList.add('btn', "btn-primary-addUsers");
            addUsersBtn.textContent = "Add Users";
            addUsersBtn.addEventListener('click', async () => {
                createUserContainer();

                const selectedUsers = await showUsersInContainer();
                updateAddUsersBtn(selectedUsers);
            });

            const modalAppend = document.getElementById('modal-footer');
            modalAppend.innerHTML = '';
            modalAppend.appendChild(addUsersBtn);
        }

        $('#groupDetailsModal').modal('show');
    } else {
        alert("NO GROUP SELECTED");
    }
}

//JOIN GROUP VIA LINK
async function joinGroupViaLink(groupId) {
    try {
        console.log(userId, groupId);
        const response = await axios.post(`/groups/${groupId}/add-users-via-link`, {
            userId: userId,
            groupId: groupId,
        }, { headers });
        console.log(response);

        if (response.status === 201) {
            console.log(`USER ADDED TO GROUP ID: ${groupId}`);
            joinRoom()

            alert(`Successfully joined group with ID: ${groupId}`);
        }
    } catch (err) {
        console.log(err, "ERROR JOINING THE GROUP");
    }
}

//CREATE USER CONTAINER
function createUserContainer() {
    const userContainer = document.createElement('div');
    userContainer.id = 'dynamicUserContainer';
    userContainer.classList.add('users-container');

    const appendUsers = document.getElementById('appendUsersToAdd');
    appendUsers.appendChild(userContainer);
}

//DISPLAY USER CONTAINER
async function showUsersInContainer() {
    const groupId = getCurrentGroup().id;
    console.log("GROUP ID IS", groupId);
    try {

        //LIST OF ALL USERS
        const allUserList = await axios.get('/users');
        const allUsers = allUserList.data.users;

        //LIST OF USERS IN THE GROUP
        const response = await axios.get(`/groups/${groupId}/users`)
        const groupMembersDetails = response.data.group;
        const groupUsers = groupMembersDetails.members.map(member => member.userId);

        const dynamicUserContainer = document.getElementById('dynamicUserContainer');
        dynamicUserContainer.innerHTML = '';

        const selectedUsers = [];

        allUsers.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-div';

            //IF USER IS ALREADY IN THE GROUP
            const userInGroup = groupUsers.includes(user.id);

            // Create a username element
            const userName = document.createElement('h6');
            userName.textContent = user.username;
            userDiv.appendChild(userName);

            if (userInGroup) {
                const message = document.createElement('p');
                message.textContent = "This user is already in the group.";
                message.style.color = 'red'
                userDiv.appendChild(message);
            } else {
                // Create a checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'selectedUsers';
                checkbox.checked = userInGroup;
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        selectedUsers.push(user);
                    } else {
                        const index = selectedUsers.findIndex(selectedUser => selectedUser.id === user.id);
                        if (index !== -1) {
                            selectedUsers.splice(index, 1);
                        }
                    }

                    updateAddUsersBtn(selectedUsers);
                })
                userDiv.appendChild(checkbox);
            }

            dynamicUserContainer.appendChild(userDiv);
        });
        return selectedUsers;
    } catch (err) {
        console.error(err, 'ERROR FETCHING USERS');
    }
}

//UPDATE ADD USERS BUTTON
function updateAddUsersBtn(selectedUsers) {
    const addUsersBtn = document.createElement('button');
    addUsersBtn.classList.add('btn', 'btn-primary-addUsers');

    if (selectedUsers.length > 0) {
        addUsersBtn.textContent = `Add ${selectedUsers.length} Users`;
        addUsersBtn.addEventListener('click', () => {
            submitUsersToGroup(selectedUsers);
        });
    } else {
        addUsersBtn.textContent = 'Add Users';
        addUsersBtn.addEventListener('click', () => {
            createUserContainer();
            showUsersInContainer();
        });
    }

    const modalAppend = document.getElementById('modal-footer');
    modalAppend.innerHTML = '';
    modalAppend.appendChild(addUsersBtn);
}
//ADD USERS TO OLD GROUP
async function submitUsersToGroup(selectedUsers) {
    const groupId = getCurrentGroup().id;

    try {
        const response = await axios.post(`/groups/${groupId}/add-users`, {
            selectedUserIds: selectedUsers.map(user => user.id),
        });

        // console.log('Users added to the group:', response.data);
        alert('Users added successfully to the group!');

        //NOTIFY OTHER USERS ABOUT NEW MEMBERS
        socket.emit('add-users-to-group', groupId, selectedUsers);

        $('#groupDetailsModal').modal('hide');

        updateGroupMembers(groupId);

    } catch (err) {
        console.error('Error adding users to the group:', err);
        alert('Failed to add users to the group. Please try again.');
    }
}

//UPDATE GROUP MEMBERS
async function updateGroupMembers(groupId) {
    try {
        const response = await axios.get(`/groups/${groupId}/users`, { headers });

        displayUsersInGroup(groupId);
    } catch (err) {
        console.error('Error getting group members: ', err);
    }
}
//SHOW USERS IN GROUPS
async function displayUsersInGroup(groupId) {
    try {
        const response = await axios.get(`${baseUrl}/groups/${groupId}/users`, { headers });
        const userList = response.data.group.members;

        // console.log(response);

        const adminName = response.data.group.adminName;
        const adminId = response.data.group.adminId;

        const groupDetailsUserList = document.getElementById('groupDetailsUserList');
        groupDetailsUserList.innerHTML = '';

        if (!userList || userList.length === 0) {
            console.log('No users in the group.');
            return;
        }

        userList.forEach(user => {
            // console.log(user);
            const userDiv = document.createElement('div');
            userDiv.className = 'user-div';

            const userNameSpan = document.createElement('span');
            userNameSpan.textContent = user.username;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.classList.add('btn', 'btn-danger', 'float-right');
            removeButton.addEventListener('click', () => removeMembersFromGroup(groupId, user.userId, adminId));

            const userTypeSpan = document.createElement('span');
            userTypeSpan.textContent = user.username === adminName ? 'Admin' : 'Member';

            userDiv.appendChild(userNameSpan);
            userDiv.appendChild(userTypeSpan);
            userDiv.appendChild(removeButton);

            groupDetailsUserList.appendChild(userDiv);
        });
    } catch (err) {
        console.log(err, "ERROR FETCHING USERS IN GROUP")
    }

}
//SHARE INVITES
async function openShareModal() {
    const shareModal = document.getElementById('shareModal');
    const inviteLinkInput = document.getElementById('inviteLink');

    const link = generateInviteLink();
    inviteLinkInput.value = link;

    shareModal.style.display = 'block';

    const groupId = getCurrentGroup().id;
    try {
        const groupResponse = await axios.get(`/groups/${groupId}/users`);
        const groupUsers = groupResponse.data.group.members;
        console.log(groupUsers);

        const allUserResponse = await axios.get('/users');
        const allUsers = allUserResponse.data.users;
        console.log(allUsers);

        const userListElement = document.getElementById('userList');
        userListElement.innerHTML = '';

        const userNotInGroup = allUsers.filter(user => !groupUsers.some(groupUser => groupUser.userId === user.id));
        console.log(userNotInGroup);

        if (userNotInGroup.length === 0) {
            const allUserMessage = document.createElement('div');
            allUserMessage.className = 'allUsers';
            allUserMessage.textContent = "ALL USERS ARE ALREADY IN THIS GROUP";
            userListElement.appendChild(allUserMessage);
        } else {

            userNotInGroup.forEach(user => {
                const userDiv = document.createElement('div');

                // Create a checkbox
                const checkboxInput = document.createElement('input');
                checkboxInput.type = 'checkbox';
                checkboxInput.value = user.username;
                // checkboxInput.checked = false;
                userDiv.appendChild(checkboxInput);

                // Display username next to checkbox
                const usernameSpan = document.createElement('span');
                usernameSpan.style.marginLeft = '10px';
                usernameSpan.innerText = user.username;
                usernameSpan.id = user.id;
                userDiv.appendChild(usernameSpan);

                // Append the list item to the user list
                userListElement.appendChild(userDiv);
            });
        }

    } catch (err) {
        console.log(err, "ERROR IN DISPLAYING USERS")
    }

}
function closeShareModal() {
    const shareModal = document.getElementById('shareModal');
    shareModal.style.display = 'none';
}
function generateInviteLink() {
    const uniqueIdentifier = Date.now().toString();
    const inviteLink = `${baseUrl}/invite/${uniqueIdentifier}`;
    return inviteLink;
}
//COPY TO CLIPBOARD
function copyToClipboard() {
    const inviteLinkInput = document.getElementById('inviteLink');

    inviteLinkInput.select();
    document.execCommand('copy');

    alert('INVITE LINK COPIED TO CLIPBOARD')
}
//SEND INVITES
function sendInvites() {
    const selectedUsers = Array.from(document.querySelectorAll('#userList input:checked'))
        .map(checkboxInput => checkboxInput.value);

    console.log(Array.from(document.querySelectorAll('#usersList input:checked')));

    if (!selectedUsers || selectedUsers.length === 0) {
        return alert("PLEASE SELECT AT LEAST ONE USER");
    }

    const inviteLink = generateInviteLink();
    const groupId = getCurrentGroup().id;

    for (const user of selectedUsers) {
        console.log(user);
        socket.emit('send-invite', {
            groupId: groupId,
            username: user,
            inviteLink: inviteLink,
        });

        console.log(`SENDING INV TO ${user}: ${inviteLink}`);
    }

    alert('INVITE SENT SUCCESSFULLY');
    closeShareModal();
}

function appendNotificationToHomepage(notification) {
    // console.log("APPENDING TO HP", notification);

    const notificationDiv = document.createElement('div');
    notificationDiv.classList.add('notification-item');
    notificationDiv.dataset.timestamp = new Date().getTime();
    notificationDiv.innerHTML = `<p class= "notificationUserName">${notification.username}:</p>
    <span class="notificationMsg">${notification.message}</span>`;

    const homePageNotifyBar = document.getElementById('notification-bar');
    if (homePageNotifyBar) {
        if(!isJoinRoomNotification(notification)) {
            notificationBar.appendChild(notificationDiv);
        }

    } else {
        console.log("HOMEPAGE NOTIFICATION BAR NOT FOUND");
    }
}

function isJoinRoomNotification(notification) {
    return notification.message.includes('joined the group');
}

//UPDATE UNREAD COUNT
// let unreadCount = 0
// function updateUnreadCount() {
//     const unreadCountEle = document.getElementById('unread-count');

//     console.log("Updating unread count:", unreadCount);

//     if (unreadCountEle) {
//         unreadCountEle.textContent = unreadCount.toString();
//     } else {
//         console.error("Element with id 'unread-count' not found.");
//     }
// }

//ANIMATE BELL
let animationInterval;
let isAnimating = false;
// const bellSound = new Audio('/assets/sounds/bell_ringing.mp3');
function animateBell() {
    if (!isAnimating) {
        animationInterval = setInterval(toggleBellAnimation, 500);
        isAnimating = true;
    }
}
function toggleBellAnimation() {
    const bellIcon = document.getElementById('notification-bell');
    bellIcon.classList.toggle('animate');
}
function stopAnimation() {
    clearInterval(animationInterval);
    isAnimating = false;
    const bellIcon = document.getElementById('notification-bell');
    bellIcon.classList.remove('animate');
};
// Add event listener for clicking the bell icon to show the modal
document.getElementById('notification-bell').addEventListener('click', () => {
    stopAnimation();
    displayNotificationModal();
});

function displayNotificationModal() {
    const notificationModal = document.getElementById('notification-modal');
    notificationModal.style.display = 'block';

    // If user clicks on x button or outside of the modal, close it
    document.getElementById('close-button')
        .addEventListener('click', () => closeNotificationModal());
    notificationModal.addEventListener('click', () => closeNotificationModal());

    // If the user clicks outside of the modal, hide it
    notificationModal.addEventListener('click', (event) => {
        if (event.target === notificationModal) {
            closeNotificationModal();
        }
    });

    // Play a sound when a notification is clicked
    document.querySelectorAll('.notification-item').forEach((element) => {
        element.addEventListener('click', playSoundOnClick);
    });

    document.getElementById('notification-bell').disabled = true;
    document.getElementById('notification-bell').title = 'Show Notifications';
    document.getElementById('notification-bell').src = '/static/images/notifications_off.png';

    unreadCount++
    updateUnreadCount();
}
// Function to hide the notification modal and reset everything
function closeNotificationModal() {
    stopAnimation();

    const notificationModal = document.getElementById('notification-modal');
    notificationModal.style.display = 'none';

    // Enable the bell icon again
    document.getElementById('notification-bell').disabled = false;
    document.getElementById('notification-bell').title = 'Show Notifications';
    document.getElementById('notification-bell').src = '/static/images/notifications_on.png';

    // Remove event listener from the close button
    document.getElementById('close-button').removeEventListener('click', () => closeNotificationModal());

    unreadCount = 0;
    updateUnreadCount();
}

//CREATE OPTION
function createOption(optionText, onClick) {
    let optionDiv = document.createElement("div");
    optionDiv.textContent = optionText;
    optionDiv.classList.add('group-option');
    optionDiv.addEventListener('click', onClick);
    return optionDiv;
}

//EDIT GROUP
async function editGroup(group) {
    const isAdmin = userId === group.adminId.toString();
    console.log(isAdmin);

    if (isAdmin) {
        const optionsContainer = document.createElement('div');
        optionsContainer.id = "options-container";
        optionsContainer.classList.add('edit-options-container');
        const groupDetailsModal = document.getElementById('groupDetailsModalLabel');

        const groupNameOpt = createOption('UPDATE GROUP NAME', async () => {
            const newGroupName = prompt("ENTER NEW GROUP NAME...");
            if (newGroupName) {
                await updateGroupName(group.id, newGroupName);
                updateChatHeading(newGroupName);
            }
        });


        optionsContainer.appendChild(groupNameOpt);

        groupDetailsModal.appendChild(optionsContainer);

    } else {
        alert("YOU ARE NOT AN ADMIN")
    }
}

function editProfile() {
    const uploadContainer = document.createElement('div');
    uploadContainer.className = 'upload-container';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg, image/png, image/jpg';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fa fa-times"></i>';
    closeBtn.onclick = () => {
        document.body.removeChild(uploadContainer);
    }

    uploadContainer.appendChild(fileInput);
    uploadContainer.appendChild(closeBtn);

    document.body.appendChild(uploadContainer);

    fileInput.click();

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];

        if (file) {
            try {
                console.log(userId);
                const formData = new FormData();
                formData.append('profileImage', file);

                const response = await axios.post(`/users/edit-user/${userId}`, formData, { headers });

                if (response.status === 200) {
                    console.log(response);
                    const profileImage = document.getElementById('user-profile-image');

                    const newImgEle = document.createElement('img');
                    newImgEle.src = response.data.image;
                    newImgEle.alt = 'Profile Image';

                    profileImage.innerHTML = '';

                    profileImage.appendChild(newImgEle);
                    console.log("UPDATED IMAGE");

                } else {
                    throw new Error('Could not upload the image');
                }
            } catch (err) {
                console.error(err, "ERROR UPDATING IMAGE");
            } finally {
                document.body.removeChild(uploadContainer);
            }
        }
    });

}

async function updateGroupName(groupId, newGroupName) {
    try {
        const response = await axios.post(`${baseUrl}/groups/${groupId}/update-group`, {
            newGroupName: newGroupName,
        }, headers);

        console.log(response);

        alert("GROUP NAME UPDATED SUCCESSFULLY");
        window.location.reload();
    } catch (err) {
        console.log(err, "ERROR UPDATING GROUP NAME");
    }
}

async function removeMembersFromGroup(groupId, userId, adminId) {
    try {
        // console.log(adminId);
        const response = await axios.delete(`${baseUrl}/groups/${groupId}/users/${userId}`, {
            data: { adminId },
            headers
        });

        if (response.status === 200) {
            console.log(response);
            displayUsersInGroup(groupId);
            alert(`USER ${response.data.removedUserName}  REMOVED FROM THE GROUP`);
        } else {
            console.log(err, 'SOMETHING WENT WRONG TRY AGAIN LATER')

        }
    } catch (err) {
        console.error(err, "ERROR REMOVING USER FROM THE GROUP");
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