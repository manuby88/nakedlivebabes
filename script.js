// ============ TEMPORARY: DISABLE PROTECTION FOR TESTING ============
// Remove this after testing!

// Remove all keyboard event listeners
document.removeEventListener('keydown', function(){});
document.removeEventListener('contextmenu', function(){});

// Re-enable right click
document.oncontextmenu = null;

// Re-enable F12 and dev tools
document.onkeydown = null;

console.log('🔓 Protection disabled for testing');
// ============ CONFIGURATION ============
// REPLACE WITH YOUR ACTUAL VALUES
const MASTER_KEY = '$2a$10$/73BHVkiHDdroKUGU7j2JuqgjESyGWvbXU3iU.piqoZTj4uUA4moi'; // Your master key
const BIN_ID = '699881a243b1c97be98eaf4d'; // Your announcement bin ID
const GALLERY_BIN_ID = '69a04e22ae596e708f4c3ca2'; // Your gallery bin ID
const ADMIN_PASSWORD = 'kojja emma';

// ============ ANNOUNCEMENT FUNCTIONS ============

// Load announcements
async function loadAnnouncements() {
    const list = document.getElementById("announcement-list");
    if (!list) return;
    
    try {
        list.innerHTML = "<p style='text-align:center; color:#666;'>Loading announcements...</p>";
        
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
            list.innerHTML = "<p style='text-align:center; color:#666;'>No announcements yet.</p>";
            return;
        }
        
        announcements.forEach(item => {
            const div = document.createElement("div");
            div.className = "announcement-item";
            div.style.cssText = `
                background: #f8f9fa;
                border-left: 4px solid #007bff;
                padding: 15px;
                margin-bottom: 15px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            
            const message = document.createElement('p');
            message.style.cssText = `
                margin: 0 0 10px 0;
                color: #333;
                font-size: 16px;
            `;
            message.textContent = item.message || item;
            
            const date = document.createElement('small');
            date.style.cssText = `
                color: #666;
                font-size: 12px;
            `;
            date.textContent = item.date || new Date().toLocaleString();
            
            div.appendChild(message);
            div.appendChild(date);
            list.appendChild(div);
        });
    } catch (error) {
        console.error('Error:', error);
        list.innerHTML = "<p style='text-align:center; color:#dc3545;'>Error loading announcements.</p>";
    }
}

// Post announcement
async function postAnnouncement() {
    const password = document.getElementById("adminPass").value;
    const message = document.getElementById("announcementText").value;
    const msgEl = document.getElementById("adminMessage");
    
    msgEl.innerHTML = "";
    msgEl.style.cssText = "margin-top:10px; padding:10px; border-radius:4px;";
    
    if (!message.trim()) {
        msgEl.innerHTML = "❌ Please enter a message";
        msgEl.style.backgroundColor = "#f8d7da";
        msgEl.style.color = "#721c24";
        return;
    }
    
    if (password !== ADMIN_PASSWORD) {
        msgEl.innerHTML = "❌ Wrong password";
        msgEl.style.backgroundColor = "#f8d7da";
        msgEl.style.color = "#721c24";
        return;
    }
    
    try {
        msgEl.innerHTML = "⏳ Posting...";
        msgEl.style.backgroundColor = "#cce5ff";
        msgEl.style.color = "#004085";
        
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
            msgEl.style.backgroundColor = "#d4edda";
            msgEl.style.color = "#155724";
            
            loadAnnouncements();
            
            setTimeout(() => {
                msgEl.innerHTML = "";
            }, 3000);
        }
    } catch (error) {
        console.error('Error:', error);
        msgEl.innerHTML = "❌ Error posting";
        msgEl.style.backgroundColor = "#f8d7da";
        msgEl.style.color = "#721c24";
    }
}

// Clear announcements
async function clearAnnouncements() {
    const password = document.getElementById("adminPass").value;
    const msgEl = document.getElementById("adminMessage");
    
    msgEl.style.cssText = "margin-top:10px; padding:10px; border-radius:4px;";
    
    if (password !== ADMIN_PASSWORD) {
        msgEl.innerHTML = "❌ Wrong password";
        msgEl.style.backgroundColor = "#f8d7da";
        msgEl.style.color = "#721c24";
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
            msgEl.style.backgroundColor = "#d4edda";
            msgEl.style.color = "#155724";
            
            document.getElementById("adminPass").value = "";
            loadAnnouncements();
            
            setTimeout(() => {
                msgEl.innerHTML = "";
            }, 3000);
        }
    } catch (error) {
        console.error('Error:', error);
        msgEl.innerHTML = "❌ Error clearing";
        msgEl.style.backgroundColor = "#f8d7da";
        msgEl.style.color = "#721c24";
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
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load');
        
        const data = await response.json();
        const images = data.images || [];
        
        console.log("Gallery loaded:", images.length, "images");
        
        // Display public gallery
        container.innerHTML = "";
        
        if (images.length === 0) {
            container.innerHTML = "<p>No images in gallery yet.</p>";
        } else {
            container.style.display = 'grid';
            container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
            container.style.gap = '15px';
            
            images.forEach(img => {
                const div = document.createElement('div');
                div.style.border = '1px solid #ddd';
                div.style.borderRadius = '8px';
                div.style.overflow = 'hidden';
                
                div.innerHTML = `
                    <img src="${img.data}" style="width:100%; height:200px; object-fit:cover;">
                    ${img.caption ? `<p style="padding:10px; margin:0;">${img.caption}</p>` : ''}
                `;
                container.appendChild(div);
            });
        }
        
        // Display admin list
        if (adminList) {
            adminList.innerHTML = "";
            
            if (images.length === 0) {
                adminList.innerHTML = "<p>No images uploaded yet.</p>";
            } else {
                images.forEach((img, index) => {
                    const div = document.createElement('div');
                    div.style.marginBottom = '15px';
                    div.style.padding = '10px';
                    div.style.border = '1px solid #ddd';
                    div.style.borderRadius = '5px';
                    div.style.backgroundColor = '#f9f9f9';
                    
                    div.innerHTML = `
                        <img src="${img.data}" style="width:100%; height:150px; object-fit:cover; border-radius:5px;">
                        <p><strong>Image ${index + 1}</strong> ${img.caption || ''}</p>
                        <p><small>${img.date || ''}</small></p>
                        <button onclick="deleteImage(${index})" style="background:#dc3545; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; width:100%;">Delete</button>
                    `;
                    adminList.appendChild(div);
                });
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = "<p>Error loading gallery.</p>";
    }
}

// Preview image
window.previewImage = function(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("imagePreview");
    const uploadBtn = document.getElementById("uploadBtn");
    
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        alert("❌ Image too large! Max 5MB");
        return;
    }
    
    selectedImage = file;
    
    const reader = new FileReader();
    reader.onload = e => {
        preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%; max-height:200px; border:2px solid green;">`;
    };
    reader.readAsDataURL(file);
    
    uploadBtn.disabled = false;
};

// Add this function to compress images
function compressImage(file, maxSize = 100 * 1024) { // 100KB max
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions (max 800px width)
                const maxWidth = 800;
                if (width > maxWidth) {
                    height = (maxWidth * height) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Compress to JPEG at 70% quality
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.7);
            };
        };
        reader.onerror = reject;
    });
}

// Update your previewImage function
window.previewImage = async function(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("imagePreview");
    const uploadBtn = document.getElementById("uploadBtn");
    
    if (!file) return;
    
    try {
        // Compress the image
        const compressedBlob = await compressImage(file);
        selectedImage = compressedBlob;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = e => {
            preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%; max-height:200px; border:2px solid green;"><p style="color:green;">✅ Image compressed successfully!</p>`;
        };
        reader.readAsDataURL(compressedBlob);
        
        uploadBtn.disabled = false;
    } catch (error) {
        alert("Error compressing image: " + error.message);
    }
};

// Upload image
window.uploadImage = async function() {
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
                    'X-Bin-Meta': 'false'
                }
            });
            
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
                uploadBtn.disabled = true;
                uploadBtn.textContent = "📤 Upload Image";
                selectedImage = null;
                
                alert("✅ Image uploaded!");
                loadGallery();
            } else {
                const errorText = await putRes.text();
                alert("❌ Upload failed: " + errorText);
            }
        };
        
    } catch (error) {
        console.error('Error:', error);
        alert("❌ Upload failed: " + error.message);
        uploadBtn.disabled = false;
        uploadBtn.textContent = "📤 Upload Image";
    }
};

// Delete image
window.deleteImage = async function(index) {
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
        const images = data.images || [];
        
        images.splice(index, 1);
        
        await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify({ images: images })
        });
        
        alert("✅ Image deleted!");
        loadGallery();
        
    } catch (error) {
        console.error('Error:', error);
        alert("❌ Delete failed");
    }
};

// Simple test function
window.testJSONBin = async function() {
    const result = document.createElement('div');
    result.style.cssText = 'position:fixed; top:50px; left:10px; background:white; border:2px solid black; padding:20px; z-index:10000; max-width:500px;';
    
    try {
        // Test read
        const readRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        const readData = await readRes.json();
        
        result.innerHTML = `
            <h3>✅ Test Results:</h3>
            <p><strong>Read successful!</strong></p>
            <p>Current images: ${readData.images ? readData.images.length : 0}</p>
            <p>Bin ID: ${GALLERY_BIN_ID}</p>
            <p>Master Key: ${MASTER_KEY.substring(0, 20)}...</p>
            <button onclick="this.parentElement.remove()" style="margin-top:10px;">Close</button>
        `;
    } catch (error) {
        result.innerHTML = `
            <h3 style="color:red;">❌ Test Failed:</h3>
            <p>${error.message}</p>
            <p>Check your Bin ID and Master Key</p>
            <button onclick="this.parentElement.remove()" style="margin-top:10px;">Close</button>
        `;
    }
    
    document.body.appendChild(result);
};


