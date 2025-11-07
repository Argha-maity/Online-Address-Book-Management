const profileForm = document.getElementById('profileForm');
const passwordForm = document.getElementById('passwordForm');
const photoUpload = document.getElementById('photoUpload');
const profilePhotoDisplay = document.getElementById('profilePhotoDisplay');
const usernameDisplay = document.getElementById('usernameDisplay');
const backendBase = "http://localhost:8001";

function getToken() {
    return localStorage.getItem("token");
}

async function fetchUserProfile() {
    const token = getToken();
    if (!token) {
        alert("Session expired. Please log in.");
        window.location.href = "../register/register.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8001/api/users/profile`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            const user = data.user;
            document.getElementById('username').value = user.username || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('contactNo').value = user.contactNo || '';
            usernameDisplay.textContent = user.username || "User Account";

            if (user.profilePhotoUrl && user.profilePhotoUrl !== "default-avatar.png") {
                profilePhotoDisplay.src = `${backendBase}${user.profilePhotoUrl}`;
            } else {
                profilePhotoDisplay.src = `${backendBase}/uploads/profile_photos/default-avatar.png`;
            }

            if (response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "../register/register.html";
            }


        } else {
            alert(data.message || "Failed to load profile data.");
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        alert("Error connecting to server to load profile.");
    }
}

// 1. Handle updating personal information
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getToken();
    const btn = document.getElementById('saveProfileBtn');

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    const updatedData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        contactNo: document.getElementById('contactNo').value,
    };

    try {
        const response = await fetch(`http://localhost:8001/api/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Profile updated successfully!");
            localStorage.setItem("username", updatedData.username);
            usernameDisplay.textContent = updatedData.username;
        } else {
            alert(data.message || "Failed to update profile.");
        }

    } catch (error) {
        console.error("Error updating profile:", error);
        alert("An error occurred during profile update.");
    } finally {
        btn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        btn.disabled = false;
    }
});


passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getToken();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        alert("New password and confirmation do not match.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8001/api/users/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Password updated successfully! Please log in with your new password.");
            passwordForm.reset();
            localStorage.removeItem("token");
            window.location.href = "../register/register.html";
        } else {
            alert(data.message || "Failed to change password. Check your current password.");
        }

    } catch (error) {
        console.error("Error changing password:", error);
        alert("An error occurred while changing password.");
    }
});

async function uploadProfilePhoto(file) {
    const token = getToken();
    if (!token) {
        alert("Please log in again.");
        return;
    }

    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
        const response = await fetch(`http://localhost:8001/api/users/profile-photo`, {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        
        // DEBUG: Log the actual response
        console.log("Upload response:", data);
        console.log("Response status:", response.status);

        if (response.ok) {
            alert("Profile photo updated successfully!");
            // Try different possible response structures
            if (data.profilePhotoUrl) {
                profilePhotoDisplay.src = `${backendBase}${data.profilePhotoUrl}`;
            } else if (data.user && data.user.profilePhotoUrl) {
                profilePhotoDisplay.src = `${backendBase}${data.user.profilePhotoUrl}`;
            } else if (data.user && data.user.profilePhoto) {
                profilePhotoDisplay.src = `${backendBase}${data.user.profilePhoto}`;
            } else {
                // If we can't find the photo in response, refetch the profile
                console.log("Photo URL not found in response, refetching profile...");
                fetchUserProfile();
            }
        } else {
            alert(data.message || "Failed to upload photo.");
            // Always refetch profile on error to sync state
            fetchUserProfile();
        }

    } catch (error) {
        console.error("Error uploading photo:", error);
        alert("An error occurred during photo upload.");
        fetchUserProfile();
    }
}

function handlePhotoUpload() {
    const file = photoUpload.files[0];
    if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF)');
            return;
        }

        // Validate file size (e.g., 5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('Please select an image smaller than 5MB');
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            profilePhotoDisplay.src = e.target.result;
        };
        reader.readAsDataURL(file);
        
        // Upload the file
        uploadProfilePhoto(file);
    }
}


document.addEventListener('DOMContentLoaded', fetchUserProfile);