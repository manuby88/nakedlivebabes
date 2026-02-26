// ============ CONFIGURATION ============
// REPLACE WITH YOUR ACTUAL VALUES FROM JSONBIN.IO
const MASTER_KEY = '$2a$10$/73BHVkiHDdroKUGU7j2JuqgjESyGWvbXU3iU.piqoZTj4uUA4moi'; // Keep for announcements
const ACCESS_KEY = '$2a$10$B8M5zdwJWxxYFgfTlkePlOn51jF.4/dKR5VFty21R4SocxHvPH812'; // Create this in JSONBin.io for gallery
const BIN_ID = '699881a243b1c97be98eaf4d'; // Your announcement bin ID
const GALLERY_BIN_ID = '69a04e22ae596e708f4c3ca2'; // Your gallery bin ID
const ADMIN_PASSWORD = 'admin123';

// ============ ANNOUNCEMENT FUNCTIONS (using Master Key) ============

// Load announcements
async function loadAnnouncements() {
    const list = document.getElementById("announcement-list");
    if (!list) return;
    
    try {
        list.innerHTML = "<p>Loading announcements...</p>";
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load');
        
        const data = await response.json();
        const announcements = data.announcements || [];
        
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
        console.error('Error:', error);
        list.innerHTML = "<p>Error loading announcements.</p>";
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
        const getRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        const data = await getRes.json();
        const announcements = data.announcements || [];
        
        announcements.unshift({
            message: message.trim(),
            date: new Date().toLocaleString()
        });
        
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
        console.error('Error:', error);
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
        console.error('Error:', error);
        msgEl.innerHTML = "❌ Error clearing";
        msgEl.style.color = "red";
    }
}

// ============ GALLERY FUNCTIONS (using Access Key) ============
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
                'X-Access-Key': ACCESS_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const images = data.images || [];
        
        console.log("Gallery loaded:", images.length, "images");
        
        // Display public gallery
        displayPublicGallery(images);
        
        // Display admin panel
        if (adminList) {
            displayAdminGallery(images);
        }
        
    } catch (error) {
        console.error('Gallery error:', error);
        container.innerHTML = "<p>Error loading gallery. Check your Access Key.</p>";
    }
}

// Display public gallery
function displayPublicGallery(images) {
    const container = document.getElementById("gallery-container");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (images.length === 0) {
        container.innerHTML = "<p>No images in gallery yet.</p>";
        return;
    }
    
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    container.style.gap = '20px';
    
    images.forEach((img, index) => {
        const card = document.createElement('div');
        card.style.backgroundColor = '#fff';
        card.style.borderRadius = '10px';
        card.style.overflow = 'hidden';
        card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        card.style.transition = 'transform 0.3s';
        card.style.cursor = 'pointer';
        
        card.onmouseover = () => { card.style.transform = 'scale(1.03)'; };
        card.onmouseout = () => { card.style.transform = 'scale(1)'; };
        
        card.innerHTML = `
            <img src="${img.data}" alt="${img.caption || ''}" 
                 style="width:100%; height:250px; object-fit:cover; display:block;">
            ${img.caption ? 
                `<div style="padding:15px; text-align:center; font-weight:500; background:linear-gradient(to right, #f8f9fa, #fff);">
                    ${img.caption}
                </div>` : 
                ''
            }
            <div style="padding:8px 15px; font-size:12px; color:#666; background:#f8f9fa; border-top:1px solid #eee;">
                🖼️ Image ${index + 1} • ${img.date || 'No date'}
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Display admin gallery
function displayAdminGallery(images) {
    const list = document.getElementById("image-list");
    if (!list) return;
    
    list.innerHTML = "";
    
    if (images.length === 0) {
        list.innerHTML = "<p>No images uploaded yet. Use the form above to add images.</p>";
        return;
    }
    
    images.forEach((img, index) => {
        const card = document.createElement('div');
        card.style.marginBottom = '25px';
        card.style.padding = '20px';
        card.style.border = '1px solid #e0e0e0';
        card.style.borderRadius = '12px';
        card.style.backgroundColor = '#ffffff';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <span style="background:#007bff; color:white; padding:5px 15px; border-radius:20px; font-size:14px; font-weight:bold;">
                    Image #${index + 1}
                </span>
                <span style="color:#666; font-size:13px;">
                    📅 ${img.date || 'No date'}
                </span>
            </div>
            
            <img src="${img.data}" 
                 style="width:100%; height:200px; object-fit:cover; border-radius:8px; margin-bottom:15px; border:1px solid #eee;">
            
            ${img.caption ? 
                `<div style="background:#f0f7ff; padding:12px; border-radius:8px; margin-bottom:15px; border-left:4px solid #007bff;">
                    <strong style="color:#007bff; display:block; margin-bottom:5px;">📝 Caption:</strong>
                    ${img.caption}
                </div>` : 
                '<p style="color:#999; font-style:italic; margin-bottom:15px;">No caption</p>'
            }
            
            <button onclick="deleteImage(${index})" 
                    style="background:#dc3545; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; width:100%; font-size:16px; font-weight:bold; transition:background 0.3s;"
                    onmouseover="this.style.background='#c82333'"
                    onmouseout="this.style.background='#dc3545'">
                🗑️ Delete This Image
            </button>
        `;
        
        list.appendChild(card);
    });
}

// Preview image
window.previewImage = function(event) {
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
    reader.onload = function(e) {
        preview.innerHTML = `
            <div style="margin-top:15px; padding:10px; background:#f0f7ff; border-radius:8px;">
                <strong style="color:#007bff;">Preview:</strong>
                <img src="${e.target.result}" style="max-width:100%; max-height:200px; border-radius:5px; margin-top:10px; border:3px solid #007bff;">
            </div>
        `;
    };
    reader.readAsDataURL(file);
    
    uploadBtn.disabled = false;
    uploadBtn.style.opacity = '1';
    uploadBtn.style.cursor = 'pointer';
    uploadBtn.style.background = '#28a745';
};

// Upload image
window.uploadImage = async function() {
    const password = document.getElementById("galleryAdminPass").value;
    const caption = document.getElementById("imageCaption").value;
    const uploadBtn = document.getElementById("uploadBtn");
    const messageEl = document.getElementById("galleryMessage");
    
    messageEl.innerHTML = "";
    
    if (password !== ADMIN_PASSWORD) {
        messageEl.innerHTML = "❌ Wrong password!";
        messageEl.style.color = "red";
        return;
    }
    
    if (!selectedImage) {
        messageEl.innerHTML = "❌ Select an image first!";
        messageEl.style.color = "red";
        return;
    }
    
    try {
        uploadBtn.disabled = true;
        uploadBtn.textContent = "⏳ Uploading...";
        uploadBtn.style.background = '#6c757d';
        
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        
        reader.onloadend = async function() {
            // Get current images
            const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
                headers: { 
                    'X-Access-Key': ACCESS_KEY,
                    'X-Bin-Meta': 'false'
                }
            });
            
            if (!getRes.ok) {
                throw new Error('Failed to fetch current images');
            }
            
            const data = await getRes.json();
            const images = data.images || [];
            
            // Add new image
            images.unshift({
                data: reader.result,
                caption: caption,
                date: new Date().toLocaleString()
            });
            
            // Save
            const putRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Key': ACCESS_KEY
                },
                body: JSON.stringify({ images: images })
            });
            
            if (putRes.ok) {
                // Clear form
                document.getElementById("imageUpload").value = "";
                document.getElementById("imageCaption").value = "";
                document.getElementById("imagePreview").innerHTML = "";
                document.getElementById("galleryAdminPass").value = "";
                uploadBtn.textContent = "📤 Upload Image";
                uploadBtn.style.background = '#28a745';
                uploadBtn.disabled = true;
                selectedImage = null;
                
                messageEl.innerHTML = "✅ Image uploaded successfully!";
                messageEl.style.color = "green";
                
                loadGallery();
                
                setTimeout(() => {
                    messageEl.innerHTML = "";
                }, 3000);
            } else {
                throw new Error('Failed to save');
            }
        };
        
    } catch (error) {
        console.error('Upload error:', error);
        messageEl.innerHTML = "❌ Upload failed: " + error.message;
        messageEl.style.color = "red";
        uploadBtn.disabled = false;
        uploadBtn.textContent = "📤 Upload Image";
        uploadBtn.style.background = '#28a745';
    }
};

// Delete image
window.deleteImage = async function(index) {
    const password = document.getElementById("galleryAdminPass").value;
    const messageEl = document.getElementById("galleryMessage");
    
    messageEl.innerHTML = "";
    
    if (password !== ADMIN_PASSWORD) {
        messageEl.innerHTML = "❌ Enter password first!";
        messageEl.style.color = "red";
        return;
    }
    
    if (!confirm("🗑️ Delete this image?")) return;
    
    try {
        const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 
                'X-Access-Key': ACCESS_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        if (!getRes.ok) {
            throw new Error('Failed to fetch images');
        }
        
        const data = await getRes.json();
        const images = data.images || [];
        
        images.splice(index, 1);
        
        const putRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': ACCESS_KEY
            },
            body: JSON.stringify({ images: images })
        });
        
        if (putRes.ok) {
            messageEl.innerHTML = "✅ Image deleted!";
            messageEl.style.color = "green";
            loadGallery();
            
            setTimeout(() => {
                messageEl.innerHTML = "";
            }, 3000);
        } else {
            throw new Error('Failed to save');
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        messageEl.innerHTML = "❌ Delete failed: " + error.message;
        messageEl.style.color = "red";
    }
};

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
});
