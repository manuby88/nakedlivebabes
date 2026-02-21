// ============ CONFIGURATION ============
// REPLACE THESE WITH YOUR ACTUAL VALUES FROM JSONBIN.IO
const MASTER_KEY = '$2a$10$/73BHVkiHDdroKUGU7j2JuqgjESyGWvbXU3iU.piqoZTj4uUA4moi';  // Get from jsonbin.io
const BIN_ID = '699881a243b1c97be98eaf4dE';          // Your announcement bin ID
const GALLERY_BIN_ID = '6998865f43b1c97be98eba4aE'; // Your gallery bin ID
const ADMIN_PASSWORD = 'admin123';

// ============ ANNOUNCEMENT FUNCTIONS ============

// Load announcements
async function loadAnnouncements() {
    const list = document.getElementById("announcement-list");
    if (!list) return;
    
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        
        if (!response.ok) throw new Error('Failed to load');
        
        const data = await response.json();
        const announcements = data.record.announcements || [];
        
        list.innerHTML = "";
        
        if (announcements.length === 0) {
            list.innerHTML = "<p>No announcements yet.</p>";
            return;
        }
        
        announcements.forEach(item => {
            const div = document.createElement("div");
            div.className = "announcement-item";
            div.innerHTML = `
                <p>${item.message}</p>
                <small>${item.date}</small>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        list.innerHTML = "<p>Error loading announcements.</p>";
    }
}

// Post announcement
async function postAnnouncement() {
    const password = document.getElementById("adminPass").value;
    const message = document.getElementById("announcementText").value;
    const msgEl = document.getElementById("adminMessage");
    
    if (!message.trim()) {
        msgEl.innerHTML = "❌ Enter a message";
        return;
    }
    
    if (password !== ADMIN_PASSWORD) {
        msgEl.innerHTML = "❌ Wrong password";
        return;
    }
    
    try {
        // Get current announcements
        const getRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        
        const data = await getRes.json();
        const announcements = data.record.announcements || [];
        
        // Add new
        announcements.unshift({
            message: message,
            date: new Date().toLocaleString()
        });
        
        // Save
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify({ announcements: announcements })
        });
        
        document.getElementById("announcementText").value = "";
        document.getElementById("adminPass").value = "";
        msgEl.innerHTML = "✅ Posted!";
        loadAnnouncements();
        
    } catch (error) {
        msgEl.innerHTML = "❌ Error";
    }
}

// Clear announcements
async function clearAnnouncements() {
    const password = document.getElementById("adminPass").value;
    const msgEl = document.getElementById("adminMessage");
    
    if (password !== ADMIN_PASSWORD) {
        msgEl.innerHTML = "❌ Wrong password";
        return;
    }
    
    if (!confirm("Delete all?")) return;
    
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify({ announcements: [] })
        });
        
        msgEl.innerHTML = "✅ Cleared!";
        loadAnnouncements();
        
    } catch (error) {
        msgEl.innerHTML = "❌ Error";
    }
}

// ============ GALLERY FUNCTIONS ============
let selectedImage = null;

// Load gallery
async function loadGallery() {
    const container = document.getElementById("gallery-container");
    if (!container) return;
    
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        
        const data = await response.json();
        const images = data.record.images || [];
        
        container.innerHTML = "";
        
        if (images.length === 0) {
            container.innerHTML = "<p>No images yet.</p>";
            return;
        }
        
        images.forEach(img => {
            const div = document.createElement("div");
            div.className = "gallery-image";
            div.innerHTML = `
                <img src="${img.data}" alt="${img.caption || ''}">
                ${img.caption ? `<div class="caption">${img.caption}</div>` : ''}
            `;
            container.appendChild(div);
        });
        
        // Also show in admin if exists
        showImageList(images);
        
    } catch (error) {
        container.innerHTML = "<p>Error loading gallery.</p>";
    }
}

// Show images in admin
function showImageList(images) {
    const list = document.getElementById("image-list");
    if (!list) return;
    
    list.innerHTML = "";
    
    if (images.length === 0) {
        list.innerHTML = "<p>No images uploaded.</p>";
        return;
    }
    
    images.forEach((img, index) => {
        const div = document.createElement("div");
        div.className = "image-item";
        div.onclick = () => deleteImage(index);
        div.innerHTML = `
            <img src="${img.data}" style="width:100%; height:150px; object-fit:cover;">
            ${img.caption ? `<div class="caption">${img.caption}</div>` : ''}
            <div style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(255,0,0,0.7); color:white; display:flex; align-items:center; justify-content:center; opacity:0; transition:0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0">Click to delete</div>
        `;
        list.appendChild(div);
    });
}

// Preview image
function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("imagePreview");
    const uploadBtn = document.getElementById("uploadBtn");
    
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        alert("Image too large! Max 5MB");
        return;
    }
    
    selectedImage = file;
    
    const reader = new FileReader();
    reader.onload = e => {
        preview.innerHTML = `<img src="${e.target.result}" style="max-width:200px;">`;
    };
    reader.readAsDataURL(file);
    
    uploadBtn.disabled = false;
}

// Upload image
async function uploadImage() {
    const password = document.getElementById("galleryAdminPass").value;
    const caption = document.getElementById("imageCaption").value;
    
    if (password !== ADMIN_PASSWORD) {
        alert("Wrong password!");
        return;
    }
    
    if (!selectedImage) {
        alert("Select an image first!");
        return;
    }
    
    try {
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        
        reader.onloadend = async function() {
            // Get current
            const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
                headers: { 'X-Master-Key': MASTER_KEY }
            });
            
            const data = await getRes.json();
            const images = data.record.images || [];
            
            // Add new
            images.unshift({
                data: reader.result,
                caption: caption,
                date: new Date().toLocaleString()
            });
            
            // Save
            await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY
                },
                body: JSON.stringify({ images: images })
            });
            
            // Clear
            document.getElementById("imageUpload").value = "";
            document.getElementById("imageCaption").value = "";
            document.getElementById("imagePreview").innerHTML = "";
            document.getElementById("galleryAdminPass").value = "";
            selectedImage = null;
            document.getElementById("uploadBtn").disabled = true;
            
            alert("✅ Uploaded!");
            loadGallery();
        };
        
    } catch (error) {
        alert("Error uploading");
    }
}

// Delete image
async function deleteImage(index) {
    const password = document.getElementById("galleryAdminPass").value;
    
    if (password !== ADMIN_PASSWORD) {
        alert("Enter password first!");
        return;
    }
    
    if (!confirm("Delete?")) return;
    
    try {
        const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        
        const data = await getRes.json();
        const images = data.record.images || [];
        
        images.splice(index, 1);
        
        await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify({ images: images })
        });
        
        alert("✅ Deleted!");
        loadGallery();
        
    } catch (error) {
        alert("Error deleting");
    }
}

// ============ INITIALIZE ============
document.addEventListener("DOMContentLoaded", function() {
    loadAnnouncements();
    loadGallery();
});

