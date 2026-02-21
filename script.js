// ============ CONFIGURATION ============
// REPLACE WITH YOUR ACTUAL VALUES
const MASTER_KEY = '$2a$10$/73BHVkiHDdroKUGU7j2JuqgjESyGWvbXU3iU.piqoZTj4uUA4moi'; // Your master key
const BIN_ID = '699881a243b1c97be98eaf4d'; // Your announcement bin ID
const GALLERY_BIN_ID = '6998865f43b1c97be98eba4a'; // Your gallery bin ID
const ADMIN_PASSWORD = 'admin123';

// ============ ANNOUNCEMENT FUNCTIONS ============

// Load announcements
async function loadAnnouncements() {
    const list = document.getElementById("announcement-list");
    if (!list) return;
    
    try {
        list.innerHTML = "<p>Loading announcements...</p>";
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const announcements = data.record?.announcements || [];
        
        list.innerHTML = "";
        
        if (announcements.length === 0) {
            list.innerHTML = "<p>No announcements yet.</p>";
            return;
        }
        
        announcements.forEach(item => {
            const div = document.createElement("div");
            div.className = "announcement-item";
            div.innerHTML = `
                <p>${item.message || item}</p>
                <small>${item.date || new Date().toLocaleString()}</small>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading announcements:', error);
        list.innerHTML = "<p>Error loading announcements. Check console.</p>";
    }
}

// Post announcement
async function postAnnouncement() {
    const password = document.getElementById("adminPass").value;
    const message = document.getElementById("announcementText").value;
    const msgEl = document.getElementById("adminMessage");
    
    msgEl.innerHTML = "";
    
    if (!message.trim()) {
        msgEl.innerHTML = "❌ Please enter a message";
        msgEl.style.color = "red";
        return;
    }
    
    if (password !== ADMIN_PASSWORD) {
        msgEl.innerHTML = "❌ Wrong password";
        msgEl.style.color = "red";
        return;
    }
    
    try {
        // Get current announcements
        const getRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await getRes.json();
        const announcements = data.record?.announcements || [];
        
        // Add new announcement
        announcements.unshift({
            message: message.trim(),
            date: new Date().toLocaleString()
        });
        
        // Save
        const putRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify({ announcements: announcements })
        });
        
        if (putRes.ok) {
            document.getElementById("announcementText").value = "";
            document.getElementById("adminPass").value = "";
            msgEl.innerHTML = "✅ Posted successfully!";
            msgEl.style.color = "green";
            loadAnnouncements();
            
            setTimeout(() => {
                msgEl.innerHTML = "";
            }, 3000);
        }
    } catch (error) {
        console.error('Error posting:', error);
        msgEl.innerHTML = "❌ Error posting";
        msgEl.style.color = "red";
    }
}

// Clear announcements
async function clearAnnouncements() {
    const password = document.getElementById("adminPass").value;
    const msgEl = document.getElementById("adminMessage");
    
    if (password !== ADMIN_PASSWORD) {
        msgEl.innerHTML = "❌ Wrong password";
        msgEl.style.color = "red";
        return;
    }
    
    if (!confirm("Delete all announcements?")) return;
    
    try {
        const putRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify({ announcements: [] })
        });
        
        if (putRes.ok) {
            msgEl.innerHTML = "✅ All cleared!";
            msgEl.style.color = "green";
            document.getElementById("adminPass").value = "";
            loadAnnouncements();
            
            setTimeout(() => {
                msgEl.innerHTML = "";
            }, 3000);
        }
    } catch (error) {
        console.error('Error clearing:', error);
        msgEl.innerHTML = "❌ Error clearing";
        msgEl.style.color = "red";
    }
}

// ============ GALLERY FUNCTIONS ============
let selectedImage = null;

// Load gallery
async function loadGallery() {
    const container = document.getElementById("gallery-container");
    const adminList = document.getElementById("image-list");
    
    if (!container) return;
    
    try {
        container.innerHTML = "<p>Loading gallery...</p>";
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const images = data.record?.images || [];
        
        console.log("Loaded images:", images.length); // Debug
        
        // Display in public gallery
        container.innerHTML = "";
        
        if (images.length === 0) {
            container.innerHTML = "<p>No images in gallery yet.</p>";
        } else {
            // Show all images
            images.forEach((img, index) => {
                const div = document.createElement("div");
                div.className = "gallery-image";
                div.style.marginBottom = "20px";
                div.style.border = "1px solid #ddd";
                div.style.borderRadius = "8px";
                div.style.overflow = "hidden";
                
                div.innerHTML = `
                    <img src="${img.data}" alt="${img.caption || ''}" style="width:100%; height:200px; object-fit:cover;">
                    ${img.caption ? `<div style="padding:10px; background:#f8f9fa; text-align:center;">${img.caption}</div>` : ''}
                    <div style="padding:5px; background:#eee; text-align:center; font-size:12px;">Image ${index + 1} of ${images.length}</div>
                `;
                container.appendChild(div);
            });
        }
        
        // Display in admin panel
        if (adminList) {
            displayImageList(images);
        }
        
    } catch (error) {
        console.error('Gallery error:', error);
        container.innerHTML = "<p>Error loading gallery. Check console.</p>";
    }
}

// Display images in admin panel
function displayImageList(images) {
    const list = document.getElementById("image-list");
    if (!list) return;
    
    list.innerHTML = "";
    
    if (images.length === 0) {
        list.innerHTML = "<p>No images uploaded yet.</p>";
        return;
    }
    
    images.forEach((img, index) => {
        const div = document.createElement("div");
        div.style.marginBottom = "25px";
        div.style.border = "1px solid #ddd";
        div.style.padding = "15px";
        div.style.borderRadius = "8px";
        div.style.backgroundColor = "#f9f9f9";
        div.style.position = "relative";
        
        // Image number
        const number = document.createElement('div');
        number.textContent = `Image #${index + 1}`;
        number.style.fontWeight = "bold";
        number.style.marginBottom = "10px";
        number.style.color = "#007bff";
        div.appendChild(number);
        
        // Image
        const imgEl = document.createElement('img');
        imgEl.src = img.data;
        imgEl.style.width = "100%";
        imgEl.style.height = "150px";
        imgEl.style.objectFit = "cover";
        imgEl.style.borderRadius = "5px";
        imgEl.style.marginBottom = "10px";
        div.appendChild(imgEl);
        
        // Caption
        if (img.caption) {
            const cap = document.createElement('p');
            cap.textContent = `📝 ${img.caption}`;
            cap.style.margin = "10px 0";
            cap.style.fontStyle = "italic";
            cap.style.color = "#555";
            div.appendChild(cap);
        }
        
        // Date
        if (img.date) {
            const date = document.createElement('small');
            date.textContent = `📅 ${img.date}`;
            date.style.color = "#666";
            date.style.display = "block";
            date.style.marginBottom = "15px";
            div.appendChild(date);
        }
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "🗑️ Delete This Image";
        deleteBtn.style.backgroundColor = "#dc3545";
        deleteBtn.style.color = "white";
        deleteBtn.style.border = "none";
        deleteBtn.style.padding = "12px";
        deleteBtn.style.borderRadius = "5px";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.width = "100%";
        deleteBtn.style.fontSize = "16px";
        deleteBtn.style.fontWeight = "bold";
        
        deleteBtn.onclick = () => deleteImage(index);
        
        div.appendChild(deleteBtn);
        list.appendChild(div);
    });
}

// Preview image before upload
function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("imagePreview");
    const uploadBtn = document.getElementById("uploadBtn");
    
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert("❌ Image too large! Max 5MB");
        event.target.value = "";
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        alert("❌ Please select an image file");
        event.target.value = "";
        return;
    }
    
    selectedImage = file;
    
    const reader = new FileReader();
    reader.onload = e => {
        preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%; max-height:200px; border-radius:5px; margin-top:10px; border:2px solid #007bff;">`;
    };
    reader.readAsDataURL(file);
    
    uploadBtn.disabled = false;
    uploadBtn.style.backgroundColor = "#007bff";
    uploadBtn.style.cursor = "pointer";
}

// Upload image
async function uploadImage() {
    const password = document.getElementById("galleryAdminPass").value;
    const caption = document.getElementById("imageCaption").value;
    
    if (password !== ADMIN_PASSWORD) {
        alert("❌ Wrong password!");
        return;
    }
    
    if (!selectedImage) {
        alert("❌ Select an image first!");
        return;
    }
    
    try {
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        
        reader.onloadend = async function() {
            // Get current images
            const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
                headers: { 
                    'X-Master-Key': MASTER_KEY,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!getRes.ok) {
                throw new Error(`HTTP error! status: ${getRes.status}`);
            }
            
            const data = await getRes.json();
            const images = data.record?.images || [];
            
            console.log("Current images before upload:", images.length);
            
            // Add new image to the beginning
            images.unshift({
                data: reader.result,
                caption: caption,
                date: new Date().toLocaleString()
            });
            
            console.log("Images after adding:", images.length);
            
            // Save back to JSONBin
            const putRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY
                },
                body: JSON.stringify({ images: images })
            });
            
            if (putRes.ok) {
                // Clear form
                document.getElementById("imageUpload").value = "";
                document.getElementById("imageCaption").value = "";
                document.getElementById("imagePreview").innerHTML = "";
                document.getElementById("galleryAdminPass").value = "";
                document.getElementById("uploadBtn").disabled = true;
                selectedImage = null;
                
                alert(`✅ Image uploaded! Total images: ${images.length}`);
                loadGallery(); // Reload to show all images
            } else {
                throw new Error('Failed to save');
            }
        };
        
    } catch (error) {
        console.error('Upload error:', error);
        alert("❌ Error uploading. Check console.");
    }
}

// Delete image
async function deleteImage(index) {
    const password = document.getElementById("galleryAdminPass").value;
    
    if (password !== ADMIN_PASSWORD) {
        alert("❌ Please enter the admin password first!");
        return;
    }
    
    if (!confirm("🗑️ Delete this image?")) return;
    
    try {
        // Get current images
        const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!getRes.ok) {
            throw new Error(`HTTP error! status: ${getRes.status}`);
        }
        
        const data = await getRes.json();
        const images = data.record?.images || [];
        
        console.log("Before delete:", images.length);
        
        // Remove image at index
        images.splice(index, 1);
        
        console.log("After delete:", images.length);
        
        // Save back
        const putRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify({ images: images })
        });
        
        if (putRes.ok) {
            alert("✅ Image deleted!");
            loadGallery(); // Reload both gallery and admin view
        } else {
            throw new Error('Failed to save');
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        alert("❌ Error deleting. Check console.");
    }
}

// ============ INITIALIZE ============
document.addEventListener("DOMContentLoaded", function() {
    // Load announcements if element exists
    if (document.getElementById("announcement-list")) {
        loadAnnouncements();
    }
    
    // Load gallery if element exists
    if (document.getElementById("gallery-container")) {
        loadGallery();
    }
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .announcement-item {
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .announcement-item p {
            margin: 0 0 10px 0;
            color: #333;
        }
        .announcement-item small {
            color: #666;
        }
        .admin-panel {
            background: #f0f0f0;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .admin-panel input, .admin-panel textarea {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .admin-panel button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        .clear-btn {
            background: #dc3545 !important;
        }
        #gallery-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
        }
        .image-upload-section {
            background: #e9ecef;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
    `;
    document.head.appendChild(style);
});
