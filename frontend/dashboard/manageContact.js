function handleAddContact() {
    window.location.href = "../addContact/addContact.html";
}

async function handleDelete(contactId) {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in again.");
        return;
    }

    try {
        const response = await fetch(`https://online-address-book-management.onrender.com/api/contact/delete/${contactId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            alert("Contact deleted successfully!");
            // Reload the contact list
            await fetchContacts();
        } else {
            alert(data.message || "Failed to delete contact.");
        }
    } catch (error) {
        console.error("Error deleting contact:", error.message);
        alert("Server error while deleting contact.");
    }
}

function handleEdit(id) {
    console.log("Editing contact with ID:", id);
    window.location.href = `../addContact/addContact.html?id=${id}`;
}

function handleImportExport() {
    window.location.href = `../import_export/import_export.html`;
}