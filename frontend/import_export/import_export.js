document.addEventListener('DOMContentLoaded', function () {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const fileName = document.getElementById('fileName');
    const fileText = document.getElementById('fileText');
    const importStatus = document.getElementById('importStatus');

    function getToken() {
        return localStorage.getItem("token");
    }

    importFile.addEventListener('change', function () {
        if (this.files.length > 0) {
            fileName.textContent = this.files[0].name;
            fileText.textContent = "Selected file:";
            importStatus.style.display = "none";
        } else {
            fileName.textContent = "No file chosen";
            fileText.textContent = "Choose file (JSON or Excel)";
        }
    });

    exportBtn.addEventListener('click', async function () {
        const token = getToken();
        if (!token) {
            showStatus("Please log in again to export.", "error");
            return;
        }

        try {
            const response = await fetch("https://online-address-book-management.onrender.com/api/contact/export", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to export contacts");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            showStatus("Contacts exported successfully!", "success");
        } catch (error) {
            console.error("Export Error:", error);
            showStatus("Error exporting contacts: " + error.message, "error");
        }
    });

    importBtn.addEventListener('click', function () {
        if (importFile.files.length === 0) {
            showStatus("Please select a file to import.", "error");
            return;
        }

        const file = importFile.files[0];
        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'json') {
            importFromJSON(file);
        } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
            importFromExcel(file);
        } else {
            showStatus("Unsupported file format. Please use JSON, Excel, or CSV files.", "error");
        }
    });

    function importFromJSON(file) {
        const reader = new FileReader();

        reader.onload = async function (e) {
            try {
                const contacts = JSON.parse(e.target.result);
                if (!Array.isArray(contacts)) throw new Error("JSON must contain an array of contacts");

                await uploadJSONToBackend(contacts, "JSON");
            } catch (error) {
                console.error("JSON Import Error:", error);
                showStatus("Invalid JSON file: " + error.message, "error");
            }
        };

        reader.readAsText(file);
    }

    function importFromExcel(file) {
        uploadFileToBackend(file, "Excel/CSV");
    }

    async function uploadJSONToBackend(contacts, sourceType) {
        const token = getToken();
        if (!token) {
            showStatus("Please log in again to import contacts.", "error");
            return;
        }

        try {
            const response = await fetch("https://online-address-book-management.onrender.com/api/contact/import", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ contacts }),
            });

            const data = await response.json();

            if (response.ok) {
                showStatus(`Successfully imported ${contacts.length} contacts from ${sourceType}!`, "success");
                if (typeof fetchContacts === "function") await fetchContacts();
            } else {
                throw new Error(data.message || "Failed to import contacts");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            showStatus("Error uploading contacts: " + error.message, "error");
        } finally {
            importFile.value = '';
            fileName.textContent = "No file chosen";
            fileText.textContent = "Choose file (JSON or Excel)";
        }
    }

    async function uploadFileToBackend(file, sourceType) {
        const token = getToken();
        if (!token) {
            showStatus("Please log in again to import contacts.", "error");
            return;
        }

        const formData = new FormData();
        formData.append("file", file); 

        try {
            const response = await fetch("https://online-address-book-management.onrender.com/api/contact/import", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                showStatus(`Successfully imported ${data.importedCount || 0} contacts from ${sourceType}!`, "success");
                if (typeof fetchContacts === "function") await fetchContacts();
            } else {
                throw new Error(data.message || "Failed to import contacts");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            showStatus("Error uploading file: " + error.message, "error");
        } finally {
            importFile.value = '';
            fileName.textContent = "No file chosen";
            fileText.textContent = "Choose file (JSON or Excel)";
        }
    }

    function showStatus(message, type) {
        importStatus.textContent = message;
        importStatus.className = "status-message " + type;
        importStatus.style.display = "block";

        if (type === "success") {
            setTimeout(() => importStatus.style.display = "none", 4000);
        }
    }
});
