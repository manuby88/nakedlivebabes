// Simple announcement system with JSONBin
const BIN_ID = '699881a243b1c97be98eaf4d'; // Get from jsonbin.io
const MASTER_KEY = '$2a$10$pou2wcwJgDl8j9voVqJ2WOsgnMR8PDGAowQOPJqM6kjbKW5sedjRy'; // Get from jsonbin.io
const ADMIN_PASSWORD = 'kojja emma 2026';

// Load and display announcements
async function loadAnnouncements() {
    const list = document.getElementById("announcement-list");
    if (!list) return;
    
    try {
        list.innerHTML = "<p>Loading announcements...</p>";
        
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
                <small>Posted: ${item.date}</small>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        console.error('Error:', error);
        list.innerHTML = "<p>Error loading announcements.</p>";
    }
}

// Post new announcement
async function postAnnouncement() {
    const password = document.getElementById("adminPass").value;
    const message = document.getElementById("announcementText").value;
    const messageEl = document.getElementById("adminMessage");
    
    messageEl.textContent = "";
    
    // Validation
    if (!message.trim()) {
        messageEl.textContent = "❌ Please enter an announcement!";
        messageEl.style.color = "red";
        return;
    }
    
    if (password !== ADMIN_PASSWORD) {
        messageEl.textContent = "❌ Incorrect password!";
        messageEl.style.color = "red";
        return;
    }
    
    try {
        // Get current announcements
        const getRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        
        const data = await getRes.json();
        const announcements = data.record.announcements || [];
        
        // Add new announcement
        announcements.unshift({
            message: message.trim(),
            date: new Date().toLocaleString()
        });
        
        // Save to JSONBin
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
            messageEl.textContent = "✅ Posted successfully!";
            messageEl.style.color = "green";
            loadAnnouncements();
            
            setTimeout(() => {
                messageEl.textContent = "";
            }, 3000);
        }
    } catch (error) {
        messageEl.textContent = "❌ Error posting!";
        messageEl.style.color = "red";
    }
}

// Clear all announcements
async function clearAnnouncements() {
    const password = document.getElementById("adminPass").value;
    const messageEl = document.getElementById("adminMessage");
    
    if (password !== ADMIN_PASSWORD) {
        messageEl.textContent = "❌ Incorrect password!";
        messageEl.style.color = "red";
        return;
    }
    
    if (!confirm("Delete all announcements?")) return;
    
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify({ announcements: [] })
        });
        
        if (response.ok) {
            messageEl.textContent = "✅ All cleared!";
            messageEl.style.color = "green";
            document.getElementById("adminPass").value = "";
            loadAnnouncements();
            
            setTimeout(() => {
                messageEl.textContent = "";
            }, 3000);
        }
    } catch (error) {
        messageEl.textContent = "❌ Error clearing!";
        messageEl.style.color = "red";
    }
}

// Add CSS
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #announcement-list {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .announcement-item {
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        
        .announcement-item p {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 16px;
        }
        
        .announcement-item small {
            color: #666;
            font-size: 12px;
        }
        
        .admin-panel {
            background: #f0f0f0;
            padding: 20px;
            margin: 20px;
            border-radius: 8px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .admin-panel input,
        .admin-panel textarea {
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
            background: #dc3545;
        }
        
        #adminMessage {
            margin-top: 10px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    addStyles();
    loadAnnouncements();
});
// ============ GALLERY MANAGEMENT ============
// IMPORTANT: Replace with your actual Gallery Bin ID from step 1
const GALLERY_BIN_ID = '6998865f43b1c97be98eba4a'; // <-- CHANGE THIS
const MASTER_KEY = '$2a$10$pou2wcwJgDl8j9voVqJ2WOsgnMR8PDGAowQOPJqM6kjbKW5sedjRy'; // Your master key from jsonbin.io
const ADMIN_PASSWORD = 'kojja emma 2026';

let selectedImageFile = null;

// Load gallery images
async function loadGallery() {
    const container = document.getElementById("gallery-container");
    if (!container) return;
    
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const images = data.record.images || [];
        
        displayGallery(images);
        displayImageList(images);
        
    } catch (error) {
        console.error('Error loading gallery:', error);
        container.innerHTML = "<p>Error loading gallery. Check console.</p>";
    }
}

// Display gallery for public
function displayGallery(images) {
    const container = document.getElementById("gallery-container");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (images.length === 0) {
        container.innerHTML = "<p>No images in gallery yet.</p>";
        return;
    }
    
    images.forEach(image => {
        const div = document.createElement("div");
        div.className = "gallery-image";
        div.innerHTML = `
            <img src="${image.data}" alt="${image.caption || 'Gallery image'}">
            ${image.caption ? `<div class="caption">${image.caption}</div>` : ''}
        `;
        container.appendChild(div);
    });
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
    
    images.forEach((image, index) => {
        const div = document.createElement("div");
        div.className = "image-item";
        div.onclick = () => deleteImage(index);
        div.innerHTML = `
            <img src="${image.data}" alt="${image.caption || 'Image'}">
            ${image.caption ? `<div class="caption">${image.caption}</div>` : ''}
            <div class="delete-overlay">🗑️ Click to delete</div>
        `;
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
        showGalleryMessage("❌ Image too large! Max 5MB", "error");
        event.target.value = "";
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showGalleryMessage("❌ Please select an image file", "error");
        event.target.value = "";
        return;
    }
    
    selectedImageFile = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%;">`;
    };
    reader.readAsDataURL(file);
    
    uploadBtn.disabled = false;
    showGalleryMessage("✅ Image ready to upload", "success");
}

// Upload image
async function uploadImage() {
    const password = document.getElementById("galleryAdminPass").value;
    const caption = document.getElementById("imageCaption").value;
    const messageEl = document.getElementById("galleryMessage");
    
    // Check password
    if (password !== ADMIN_PASSWORD) {
        showGalleryMessage("❌ Incorrect password!", "error");
        return;
    }
    
    // Check if image selected
    if (!selectedImageFile) {
        showGalleryMessage("❌ Please select an image first!", "error");
        return;
    }
    
    try {
        showGalleryMessage("⏳ Uploading...", "info");
        
        // Convert image to base64
        const reader = new FileReader();
        reader.readAsDataURL(selectedImageFile);
        
        reader.onloadend = async function() {
            const base64Image = reader.result;
            
            // Get current images
            const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
                headers: { 
                    'X-Master-Key': MASTER_KEY
                }
            });
            
            if (!getRes.ok) {
                throw new Error('Failed to fetch current images');
            }
            
            const data = await getRes.json();
            const images = data.record.images || [];
            
            // Add new image
            images.unshift({
                data: base64Image,
                caption: caption.trim(),
                date: new Date().toLocaleString()
            });
            
            // Save to JSONBin
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
                document.getElementById("uploadBtn").disabled = true;
                document.getElementById("galleryAdminPass").value = "";
                selectedImageFile = null;
                
                showGalleryMessage("✅ Image uploaded successfully!", "success");
                
                // Reload gallery
                loadGallery();
                
                setTimeout(() => {
                    document.getElementById("galleryMessage").innerHTML = "";
                }, 3000);
            } else {
                throw new Error('Failed to save');
            }
        };
        
    } catch (error) {
        console.error('Error uploading image:', error);
        showGalleryMessage("❌ Error uploading image: " + error.message, "error");
    }
}

// Delete image
async function deleteImage(index) {
    const password = document.getElementById("galleryAdminPass").value;
    const messageEl = document.getElementById("galleryMessage");
    
    if (password !== ADMIN_PASSWORD) {
        showGalleryMessage("❌ Incorrect password! Please enter password first.", "error");
        return;
    }
    
    if (!confirm("Delete this image?")) return;
    
    try {
        // Get current images
        const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY
            }
        });
        
        if (!getRes.ok) {
            throw new Error('Failed to fetch images');
        }
        
        const data = await getRes.json();
        const images = data.record.images || [];
        
        // Remove image at index
        images.splice(index, 1);
        
        // Save to JSONBin
        const putRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify({ images: images })
        });
        
        if (putRes.ok) {
            showGalleryMessage("✅ Image deleted!", "success");
            loadGallery();
            
            setTimeout(() => {
                document.getElementById("galleryMessage").innerHTML = "";
            }, 3000);
        } else {
            throw new Error('Failed to delete');
        }
        
    } catch (error) {
        console.error('Error deleting image:', error);
        showGalleryMessage("❌ Error deleting image", "error");
    }
}

// Helper function for gallery messages
function showGalleryMessage(text, type) {
    const messageEl = document.getElementById("galleryMessage");
    if (!messageEl) return;
    
    messageEl.innerHTML = text;
    messageEl.style.color = type === 'error' ? '#dc3545' : (type === 'success' ? '#28a745' : '#007bff');
}

// Make sure gallery loads when page loads
document.addEventListener("DOMContentLoaded", function() {
    // Only load gallery if the elements exist
    if (document.getElementById("gallery-container")) {
        loadGallery();
    }
});

