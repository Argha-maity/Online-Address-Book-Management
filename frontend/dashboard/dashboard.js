let contactsData = [];
let isShowingFavorites = false;

const contactListElement = document.getElementById('contactList');
const searchInput = document.getElementById('searchInput');
const groupFilter = document.getElementById('groupFilter');
const favoritesBtn = document.getElementById('favoritesBtn');
let userProfilePhotoElement = document.getElementById('userProfilePhoto');

function getToken() {
    return localStorage.getItem("token");
}

async function fetchContacts() {
    const token = getToken();
    if (!token) {
        alert("Please log in again!");
        window.location.href = "../register/register.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8001/api/contact/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (response.ok) {
            contactsData = data.contacts || data || [];
            populateGroupFilters();
            renderContactList(contactsData);
        } else {
            alert(data.message || "Failed to fetch contacts.");
        }
    } catch (error) {
        console.error("Error fetching contacts:", error.message);
        alert("Error connecting to server.");
    }
}

async function fetchUserProfile() {
    const token = getToken();
    if (!token) return; 

    try {
        const response = await fetch(`http://localhost:8001/api/users/profile`, { 
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        const userData = await response.json();
        if (response.ok && userData.user) {
            if (userData.user.profilePhotoUrl) {
                userProfilePhotoElement.src = userData.user.profilePhotoUrl;
            } else {
                userProfilePhotoElement.src = 'default-avatar.png'; 
            }
        } else {
            console.error("Failed to fetch user profile:", userData.message);
        }
    } catch (error) {
        console.error("Error fetching user profile:", error.message);
    }
}

function navigateToProfile() {
    window.location.href = "../profile/profile.html"; 
}

function createContactCard(contact) {
    return `
        <div class="contact-item" data-id="${contact._id}">
            <div class="contact-details">
                <p class="contact-name">${contact.fullName}</p>
                <div class="contact-info">
                    <p><i class="fas fa-phone-alt"></i> ${contact.contactNo}</p>
                    <p><i class="fas fa-envelope"></i> ${contact.email}</p>
                    <p><i class="fas fa-briefcase"></i> ${contact.profession || 'N/A'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${contact.address || 'Not specified'}</p>
                </div>
                <div class="contact-tags">
                    <span class="tag"><i class="fas fa-tag"></i> ${contact.groups || 'Uncategorized'}</span>
                </div>
            </div>
            <div class="contact-actions">
                <button class="btn-edit" onclick="handleEdit('${contact._id}')">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn-delete" onclick="handleDelete('${contact._id}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `;
}

function renderContactList(contactsToRender) {
    if (!contactsToRender.length) {
        contactListElement.innerHTML = '<p style="text-align:center; color:#777;">No contacts found.</p>';
        return;
    }
    contactListElement.innerHTML = contactsToRender.map(createContactCard).join('');
}

function populateGroupFilters() {
    groupFilter.innerHTML = '<option value="All">All Groups</option>';
    const groups = [...new Set(contactsData.map(c => c.groups).filter(Boolean))];
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        groupFilter.appendChild(option);
    });
}

function filterContacts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGroup = groupFilter.value;

    const filtered = contactsData.filter(contact => {
        const matchesSearch =
            contact.fullName.toLowerCase().includes(searchTerm) ||
            contact.contactNo.includes(searchTerm);

        const matchesGroup = selectedGroup === 'All' || contact.groups === selectedGroup;
        return matchesSearch && matchesGroup;
    });

    renderContactList(filtered);
}

function toggleFavorites() {
    alert("Favorites feature not implemented yet.");
}

function clearFilters() {
    searchInput.value = '';
    groupFilter.value = 'All';
    filterContacts();
}

function handleLogout() {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");
    sessionStorage.clear();
    window.location.href = "../landingPage/index.html"; 
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    const username = localStorage.getItem('username') || "User";
    const titleElement = document.getElementById('dashboardTitle');

    if (!token) {
        window.location.href = "../login/login.html";
        return;
    }

    const currentPhotoHTML = userProfilePhotoElement.outerHTML;
    titleElement.innerHTML = `${currentPhotoHTML} ${username}'s Contacts`;
    await fetchUserProfile();
    await fetchContacts();
});
