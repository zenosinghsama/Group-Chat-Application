document.getElementById("signup_form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const phoneNumber = document.getElementById("phoneInput").value;
    const password = document.getElementById("passwordInput").value;

    if(name === "" || email === "" || phoneNumber === "" || password === "") {
        alert("ALL FIELDS MANDATORY");
        return;
    }

    const obj = {
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        password: password
    }

    try {
        const response = await axios.post("/user/signup", obj)

        console.log(obj);
    if(response.status === 201) {
        alert("SUCCESSFULLY SIGNED UP")
        window.location.href = "/login.html";
    } else {
        console.error("ERROR CREATING USER", response.status);
    }
} catch (err) {
    console.log(err);
}
})