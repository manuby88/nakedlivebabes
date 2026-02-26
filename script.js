// ============ CONFIGURATION ============
// REPLACE WITH YOUR ACTUAL VALUES FROM JSONBIN.IO
const MASTER_KEY = '$2a$10$/73BHVkiHDdroKUGU7j2JuqgjESyGWvbXU3iU.piqoZTj4uUA4moi'; // Your actual master key
const BIN_ID = '699881a243b1c97be98eaf4d'; // Your announcement bin ID
const GALLERY_BIN_ID = '6999333543b1c97be9901e69'; // Your gallery bin ID
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

// ============ SIMPLE WORKING GALLERY ============
let selectedImage = null;

// Load gallery
async function loadGallery() {
    const container = document.getElementById("gallery-container");
    const adminList = document.getElementById("image-list");
    
    if (!container) return;
    
    try {
        container.innerHTML = "<p>Loading gallery...</p>";
        
        // Fetch from JSONBin
        const response = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const images = data.images || [];
        
        console.log("Loaded images:", images.length);
        
        // Show in public gallery
        displayPublicGallery(images);
        
        // Show in admin panel
        if (adminList) {
            displayAdminGallery(images);
        }
        
    } catch (error) {
        console.error('Gallery error:', error);
        container.innerHTML = "<p>Error loading gallery. Check console.</p>";
    }
}

// Display images in public gallery
function displayPublicGallery(images) {
    const container = document.getElementById("gallery-container");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (images.length === 0) {
        container.innerHTML = "<p>No images in gallery yet.</p>";
        return;
    }
    
    // Create grid layout
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    container.style.gap = '20px';
    
    images.forEach((img, index) => {
        const card = document.createElement('div');
        card.style.backgroundColor = '#fff';
        card.style.borderRadius = '8px';
        card.style.overflow = 'hidden';
        card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        card.style.position = 'relative';
        
        // Image
        const imgElement = document.createElement('img');
        imgElement.src = img.data; // This is the base64 image
        imgElement.alt = img.caption || 'Gallery image';
        imgElement.style.width = '100%';
        imgElement.style.height = '250px';
        imgElement.style.objectFit = 'cover';
        imgElement.style.display = 'block';
        
        // Caption
        if (img.caption) {
            const caption = document.createElement('div');
            caption.textContent = img.caption;
            caption.style.padding = '12px';
            caption.style.backgroundColor = '#f8f9fa';
            caption.style.color = '#333';
            caption.style.fontSize = '14px';
            caption.style.textAlign = 'center';
            card.appendChild(caption);
        }
        
        // Date (small)
        if (img.date) {
            const date = document.createElement('div');
            date.textContent = img.date;
            date.style.padding = '5px 12px 12px';
            date.style.fontSize = '12px';
            date.style.color = '#666';
            date.style.backgroundColor = '#f8f9fa';
            date.style.borderTop = '1px solid #eee';
            card.appendChild(date);
        }
        
        card.insertBefore(imgElement, card.firstChild);
        container.appendChild(card);
    });
}

// Display images in admin panel
function displayAdminGallery(images) {
    const list = document.getElementById("image-list");
    if (!list) return;
    
    list.innerHTML = "";
    
    if (images.length === 0) {
        list.innerHTML = "<p>No images uploaded yet. Click 'Upload Image' to add some.</p>";
        return;
    }
    
    images.forEach((img, index) => {
        const card = document.createElement('div');
        card.style.backgroundColor = '#fff';
        card.style.border = '1px solid #ddd';
        card.style.borderRadius = '8px';
        card.style.padding = '15px';
        card.style.marginBottom = '20px';
        card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
        
        // Header with image number
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '10px';
        
        const title = document.createElement('strong');
        title.textContent = `Image #${index + 1}`;
        title.style.color = '#007bff';
        
        const date = document.createElement('small');
        date.textContent = img.date || new Date().toLocaleString();
        date.style.color = '#666';
        
        header.appendChild(title);
        header.appendChild(date);
        card.appendChild(header);
        
        // Image preview
        const imgPreview = document.createElement('img');
        imgPreview.src = img.data;
        imgPreview.alt = img.caption || 'Preview';
        imgPreview.style.width = '100%';
        imgPreview.style.height = '200px';
        imgPreview.style.objectFit = 'cover';
        imgPreview.style.borderRadius = '5px';
        imgPreview.style.marginBottom = '10px';
        imgPreview.style.border = '1px solid #eee';
        card.appendChild(imgPreview);
        
        // Caption if exists
        if (img.caption) {
            const caption = document.createElement('p');
            caption.textContent = `📝 ${img.caption}`;
            caption.style.margin = '10px 0';
            caption.style.padding = '8px';
            caption.style.backgroundColor = '#f8f9fa';
            caption.style.borderRadius = '4px';
            caption.style.fontStyle = 'italic';
            card.appendChild(caption);
        }
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️ Delete Image';
        deleteBtn.style.backgroundColor = '#dc3545';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.padding = '10px 15px';
        deleteBtn.style.borderRadius = '4px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.width = '100%';
        deleteBtn.style.fontSize = '14px';
        deleteBtn.style.fontWeight = 'bold';
        
        deleteBtn.onclick = () => deleteImage(index);
        
        card.appendChild(deleteBtn);
        list.appendChild(card);
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
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%; max-height:200px; border-radius:5px; border:2px solid #007bff;">`;
    };
    reader.readAsDataURL(file);
    
    uploadBtn.disabled = false;
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
        // Show loading
        document.getElementById("uploadBtn").disabled = true;
        document.getElementById("uploadBtn").textContent = "⏳ Uploading...";
        
        // Convert image to base64
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        
        reader.onloadend = async function() {
            // Get current images
            const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
                headers: { 
                    'X-Master-Key': MASTER_KEY,
                    'X-Bin-Meta': 'false'
                }
            });
            
            if (!getRes.ok) {
                throw new Error('Failed to get current images');
            }
            
            const data = await getRes.json();
            const images = data.images || [];
            
            console.log("Current images:", images.length);
            
            // Add new image
            const newImage = {
                data: reader.result,
                caption: caption,
                date: new Date().toLocaleString()
            };
            
            images.unshift(newImage);
            
            console.log("After adding:", images.length);
            
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
                document.getElementById("uploadBtn").textContent = "📤 Upload Image";
                selectedImage = null;
                
                alert(`✅ Image uploaded! Total images: ${images.length}`);
                loadGallery(); // Reload to show all images
            } else {
                throw new Error('Failed to save');
            }
        };
        
    } catch (error) {
        console.error('Upload error:', error);
        alert("❌ Error uploading: " + error.message);
        document.getElementById("uploadBtn").disabled = false;
        document.getElementById("uploadBtn").textContent = "📤 Upload Image";
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
                'X-Bin-Meta': 'false'
            }
        });
        
        if (!getRes.ok) {
            throw new Error('Failed to get images');
        }
        
        const data = await getRes.json();
        const images = data.images || [];
        
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
        alert("❌ Error deleting: " + error.message);
    }
}
