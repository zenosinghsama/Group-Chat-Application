document.getElementById("signup_form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const phoneNumber = document.getElementById("phoneInput").value;
    const password = document.getElementById("passwordInput").value;

    if(name === "" || email === "" || phoneNumber === "" || password === "") {
        throw new Error("Please Fill all the fields");
    }

    const obj = {
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        password: password
    }

    try {
        const response = await axios.post("", {obj})

    if(response.status === 201) {
        window.location.href = "/login.html";
    } else {
        throw new Error("ERROR CREATING USER");
    }
} catch (err) {
    console.log(err);
}
})