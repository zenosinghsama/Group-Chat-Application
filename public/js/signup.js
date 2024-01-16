document.getElementById("signup_form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const phoneNumber = document.getElementById("phoneInput").value;
    const password = document.getElementById("passwordInput").value;

    const userImageInput = document.getElementById('userImageInput');
    const userImage = userImageInput.files[0];

    console.log('Before FormData:', name, email, phoneNumber, password, userImage);

    if(name === "" || email === "" || phoneNumber === "" || password === "") {
        alert("ALL FIELDS MANDATORY");
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('password', password);
    formData.append('profileImage', userImage);

    console.log('After FormData:', formData);
    try {
        const response = await axios.post("/signup", formData);

        console.log("RESPONSE",response);

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


