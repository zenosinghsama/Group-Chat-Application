document.getElementById("login_form").addEventListener("submit", async(e) => {
    e.preventDefault();

    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    const obj = {
        email : email,
        password : password
    }

    try {
        const response = await axios.post("/user/login", obj)

        const token = response.data.token;
        const id = response.data.id;

        if (token) {
            localStorage.setItem('Token', token);
            localStorage.setItem('ID', id);

            window.location.href = "/main.html";
        }
    } catch (err) {
        if (err.response.status === 404) {
            alert("USER DOES NOT EXIST");
        } else {
            alert("INCORRECT PASSWORD. PLEASE TRY AGAIN!");
        }
    }

   
})