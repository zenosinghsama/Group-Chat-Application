let token = localStorage.getItem("Token");

const createGroupForm = document.getElementById("createGroupForm");

createGroupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    createGroup();
})

async function createGroup() {
    const name = document.getElementById("name").value;
    const imageFile = document.getElementById("image").files[0];
    const limit = document.getElementById("limit").value;

    const data = {
        name: name,
        limit: limit
    }

    try {

       const response = await axios.post("/groups", data, {
        headers: {
            Authorization: `${token}`,
        },
       });

       if(response.status === 200) {
        $('#create-group-modal').modal("hide");
        alert("GROUP CREATED SUCCESSFULLY");
        displayGroups();
       } else {
        console.log("ERROR IN CREATING GROUPS");
       }
    } catch(err) {
        console.log("ERROR IN CREATING GROUP", err);
    }
}

async function displayGroups() {
    try {
        
        if(!token) {
            return (window.location.href = "/login.html");
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const response = await axios.get("/groups", { headers });
        

        const allGroups = response.data.allGroups;

        const tableBody = document.getElementById('group table-body');

        tableBody.innerHTML = '';

        if(allGroups.length == 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>"NO GROUPS FOUND"</td>
            `;

            tableBody.appendChild(row);
        } else {
            allGroups.forEach((group, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${index + 1} </td>
                <td><img src = "${group.image}" alt="${group.name}" width="30"></td>
                <td>${group.name}</td>
                <td>${group.limit}</td>
                <td>${group.members}</td>
                <td><button onclick = 'joinGroup(${group.id})'>Join</button></td>
                `;
    
                tableBody.appendChild(row);
            })
        }

       
    } catch(err) {
        console.log("ERROR FETCHING GROUPS ",err);
    }
}

async function joinGroup(groupId) {
    
    try {
        const response = await axios.get(`/groups/${groupId}/join`, {}, {
            headers : {
                Authorization : `Bearer ${token}`,
            },
        });

        console.log("RESPONSE FROM SERVER", response);

        if(response.status === 201) {
            //UPDATE THE MEMBERS
            const memberColumn = document.querySelector( '.members-column');
            const currentMembers = parseInt(memberColumn.innerText);
            memberColumn.innerText = (currentMembers + 1).toString();

            let joinedGroups = JSON.parse(localStorage.getItem("joinedGroups")) || [];
            joinedGroups.push(groupId);
            localStorage.setItem("joinedGroups", JSON.stringify(joinedGroups));

          

            window.location.href = `main.html?groupId=${groupId}`;
        } else {
            console.log("ERROR JOINING GROUPS: ", response.data.error);
        }
    } catch(err) {
        console.log("ERROR JOINING GROUPS", err);
    }
}

displayGroups();