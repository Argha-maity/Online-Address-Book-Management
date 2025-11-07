document.addEventListener("DOMContentLoaded", async () => {
    const form = document.querySelector("form");
    const params = new URLSearchParams(window.location.search);
    const contactId = params.get("id"); // if present, we're in EDIT mode

    const token = localStorage.getItem("token"); // assuming token saved on login
    if (!token) {
        alert("You are not logged in. Redirecting to login page...");
        window.location.href = "../login/login.html";
        return;
    }

    // If editing an existing contact
    if (contactId) {
        document.querySelector("h1").textContent = "Edit Contact Details";
        document.querySelector(".save-btn").textContent = "Update Contact";
        await loadContactData(contactId, token);
    }

    // --- Form submission handler ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const contactData = {
            fullName: form.username.value.trim(),
            contactNo: form.contactNo.value.trim(),
            email: form.email.value.trim(),
            address: form.address.value.trim(),
            profession: form.profession.value.trim(),
            groups: form.groups.value.trim(),
        };

        if (!contactData.fullName || !contactData.contactNo || !contactData.email || !contactData.address) {
            alert("Please fill in all required fields: Full Name, Contact No, Email, and Address.");
            return;
        }

        try {
            let response;
            if (contactId) {
                // Update existing contact
                response = await fetch(`http://localhost:8001/api/contact/edit/${contactId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(contactData),
                });
            } else {
                // Add new contact
                response = await fetch("http://localhost:8001/api/contact/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(contactData),
                });
            }

            const data = await response.json();

            if (response.ok) {
                alert(data.message || (contactId ? "Contact updated successfully!" : "Contact added successfully!"));
                window.location.href = "../dashboard/dashboard.html";
            } else {
                alert(data.message || "Error saving contact. Please try again.");
                console.error("API error:", data);
            }

        } catch (error) {
            console.error("Error saving contact:", error);
            alert("Network or server error while saving contact.");
        }
    });
});

async function loadContactData(contactId, token) {
    try {
        const response = await fetch(`http://localhost:8001/api/contact/${contactId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok && data.contact) {
            const form = document.querySelector("form");
            form.username.value = data.contact.fullName || "";
            form.contactNo.value = data.contact.contactNo || "";
            form.email.value = data.contact.email || "";
            form.address.value = data.contact.address || "";
            form.profession.value = data.contact.profession || "";
            form.groups.value = data.contact.groups || "";
        } else {
            alert(data.message || "Failed to load contact details.");
            console.error("Load error:", data);
        }
    } catch (error) {
        console.error("Error loading contact data:", error);
        alert("Error fetching contact information.");
    }
}

function handleCancel() {
    window.location.href = "../dashboard/dashboard.html";
}
