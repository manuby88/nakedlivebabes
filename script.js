// ============ CONFIGURATION ============
// REPLACE WITH YOUR ACTUAL VALUES FROM JSONBIN.IO
const MASTER_KEY = '$2a$10$/73BHVkiHDdroKUGU7j2JuqgjESyGWvbXU3iU.piqoZTj4uUA4moi'; // Your actual master key
const BIN_ID = '699881a243b1c97be98eaf4d'; // Your announcement bin ID
const GALLERY_BIN_ID = '69a04e22ae596e708f4c3ca2'; // Your gallery bin ID
const ADMIN_PASSWORD = 'admin123';

// ============ HELPER FUNCTION FOR FETCH ============
async function fetchFromJSONBin(binId, method = 'GET', data = null) {
    const url = `https://api.jsonbin.io/v3/b/${binId}${method === 'GET' ? '/latest' : ''}`;
    
    const headers = {
        'X-Master-Key': MASTER_KEY,
        'Content-Type': 'application/json',
        'X-Bin-Meta': 'false' // This returns just the data, not metadata
    };
    
    const options = {
        method: method,
        headers: headers
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// ============ ANNOUNCEMENT FUNCTIONS ============

// Load announcements
async function loadAnnouncements() {
    const list = document.getElementById("announcement-list");
    if (!list) return;
    
    try {
        list.innerHTML = "<p>Loading announcements...</p>";
        
        const data = await fetchFromJSONBin(BIN_ID, 'GET');
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
        list.innerHTML = "<p>Error loading announcements. Check your Master Key and Bin ID.</p>";
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
        const data = await fetchFromJSONBin(BIN_ID, 'GET');
        const announcements = data.announcements || [];
        
        // Add new announcement
        announcements.unshift({
            message: message.trim(),
            date: new Date().toLocaleString()
        });
        
        // Save
        await fetchFromJSONBin(BIN_ID, 'PUT', { announcements: announcements });
        
        document.getElementById("announcementText").value = "";
        document.getElementById("adminPass").value = "";
        msgEl.innerHTML = "✅ Posted successfully!";
        msgEl.style.color = "green";
        loadAnnouncements();
        
        setTimeout(() => {
            msgEl.innerHTML = "";
        }, 3000);
    } catch (error) {
        console.error('Error:', error);
        msgEl.innerHTML = "❌ Error posting. Check your Master Key.";
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
        await fetchFromJSONBin(BIN_ID, 'PUT', { announcements: [] });
        
        msgEl.innerHTML = "✅ All cleared!";
        msgEl.style.color = "green";
        document.getElementById("adminPass").value = "";
        loadAnnouncements();
        
        setTimeout(() => {
            msgEl.innerHTML = "";
        }, 3000);
    } catch (error) {
        console.error('Error:', error);
        msgEl.innerHTML = "❌ Error clearing";
        msgEl.style.color = "red";
    }
}

// ============ SIMPLE GALLERY MANAGEMENT ============
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
        
        if (!response.ok) throw new Error('Failed to load');
        
        const data = await response.json();
        const images = data.record?.images || data.images || [];
        
        console.log("Loaded images:", images.length);
        
        // Display public gallery
        displayPublicGallery(images);
        
        // Display admin list
        if (adminList) displayAdminGallery(images);
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = "<p>Error loading gallery. Check console.</p>";
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
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    container.style.gap = '20px';
    
    images.forEach(img => {
        const div = document.createElement('div');
        div.style.backgroundColor = '#fff';
        div.style.borderRadius = '8px';
        div.style.overflow = 'hidden';
        div.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        
        div.innerHTML = `
            <img src="${img.data}" alt="${img.caption || ''}" style="width:100%; height:200px; object-fit:cover; display:block;">
            ${img.caption ? `<div style="padding:10px; text-align:center; background:#f8f9fa;">${img.caption}</div>` : ''}
            <div style="padding:5px 10px; font-size:12px; color:#666; background:#f8f9fa; border-top:1px solid #eee;">
                ${img.date || ''}
            </div>
        `;
        
        container.appendChild(div);
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
        const div = document.createElement('div');
        div.style.marginBottom = '20px';
        div.style.padding = '15px';
        div.style.border = '1px solid #ddd';
        div.style.borderRadius = '8px';
        div.style.backgroundColor = '#f9f9f9';
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <strong style="color:#007bff;">Image #${index + 1}</strong>
                <small style="color:#666;">${img.date || ''}</small>
            </div>
            <img src="${img.data}" style="width:100%; height:150px; object-fit:cover; border-radius:5px; margin-bottom:10px;">
            ${img.caption ? `<p style="margin:10px 0; font-style:italic;">📝 ${img.caption}</p>` : ''}
            <button onclick="deleteImage(${index})" style="background:#dc3545; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; width:100%;">🗑️ Delete</button>
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
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert("❌ Image too large! Max 5MB");
        event.target.value = "";
        return;
    }
    
    selectedImage = file;
    
    const reader = new FileReader();
    reader.onload = e => {
        preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%; max-height:200px; border-radius:5px; border:2px solid #007bff;">`;
    };
    reader.readAsDataURL(file);
    
    uploadBtn.disabled = false;
    uploadBtn.style.opacity = '1';
    uploadBtn.style.cursor = 'pointer';
}

// Upload image
async function uploadImage() {
    const password = document.getElementById("galleryAdminPass").value;
    const caption = document.getElementById("imageCaption").value;
    const uploadBtn = document.getElementById("uploadBtn");
    
    if (password !== ADMIN_PASSWORD) {
        alert("❌ Wrong password!");
        return;
    }
    
    if (!selectedImage) {
        alert("❌ Select an image first!");
        return;
    }
    
    try {
        uploadBtn.disabled = true;
        uploadBtn.textContent = "⏳ Uploading...";
        
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
            
            const data = await getRes.json();
            const images = data.record?.images || data.images || [];
            
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
                uploadBtn.textContent = "📤 Upload Image";
                uploadBtn.disabled = true;
                selectedImage = null;
                
                alert(`✅ Image uploaded! Total: ${images.length}`);
                loadGallery();
            }
        };
        
    } catch (error) {
        console.error('Error:', error);
        alert("❌ Upload failed");
        uploadBtn.disabled = false;
        uploadBtn.textContent = "📤 Upload Image";
    }
}

// Delete image
async function deleteImage(index) {
    const password = document.getElementById("galleryAdminPass").value;
    
    if (password !== ADMIN_PASSWORD) {
        alert("❌ Enter password first!");
        return;
    }
    
    if (!confirm("Delete this image?")) return;
    
    try {
        const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        
        const data = await getRes.json();
        const images = data.record?.images || data.images || [];
        
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
        console.error('Error:', error);
        alert("❌ Delete failed");
    }
}

