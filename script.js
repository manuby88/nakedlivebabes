
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

// ============ GALLERY FUNCTIONS ============
let selectedImage = null;

// Load gallery
async function loadGallery() {
    const container = document.getElementById("gallery-container");
    const adminList = document.getElementById("image-list");
    
    if (!container) return;
    
    try {
        container.innerHTML = "<p style='text-align:center; color:#666;'>Loading gallery...</p>";
        
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
            container.innerHTML = "<p style='text-align:center; color:#666;'>No images in gallery yet.</p>";
        } else {
            container.style.display = 'grid';
            container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            container.style.gap = '20px';
            container.style.padding = '20px';
            
            images.forEach((img, index) => {
                const card = document.createElement('div');
                card.style.cssText = `
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    transition: transform 0.3s;
                    cursor: pointer;
                `;
                
                card.onmouseover = () => { card.style.transform = 'scale(1.03)'; };
                card.onmouseout = () => { card.style.transform = 'scale(1)'; };
                
                const imgElement = document.createElement('img');
                imgElement.src = img.data;
                imgElement.alt = img.caption || '';
                imgElement.style.cssText = `
                    width: 100%;
                    height: 250px;
                    object-fit: cover;
                    display: block;
                `;
                
                card.appendChild(imgElement);
                
                if (img.caption) {
                    const caption = document.createElement('div');
                    caption.style.cssText = `
                        padding: 15px;
                        text-align: center;
                        font-weight: 500;
                        background: linear-gradient(to right, #f8f9fa, #fff);
                    `;
                    caption.textContent = img.caption;
                    card.appendChild(caption);
                }
                
                const footer = document.createElement('div');
                footer.style.cssText = `
                    padding: 8px 15px;
                    font-size: 12px;
                    color: #666;
                    background: #f8f9fa;
                    border-top: 1px solid #eee;
                `;
                footer.innerHTML = `🖼️ Image ${index + 1} • ${img.date || 'No date'}`;
                card.appendChild(footer);
                
                container.appendChild(card);
            });
        }
        
        // Display admin list
        if (adminList) {
            adminList.innerHTML = "";
            
            if (images.length === 0) {
                adminList.innerHTML = "<p style='text-align:center; color:#666;'>No images uploaded yet. Use the form above to add images.</p>";
            } else {
                adminList.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                `;
                
                images.forEach((img, index) => {
                    const card = document.createElement('div');
                    card.style.cssText = `
                        background: white;
                        border: 1px solid #e0e0e0;
                        border-radius: 12px;
                        padding: 15px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    `;
                    
                    const header = document.createElement('div');
                    header.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 15px;
                    `;
                    
                    const badge = document.createElement('span');
                    badge.style.cssText = `
                        background: #007bff;
                        color: white;
                        padding: 5px 15px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: bold;
                    `;
                    badge.textContent = `Image #${index + 1}`;
                    
                    const date = document.createElement('span');
                    date.style.cssText = `
                        color: #666;
                        font-size: 13px;
                    `;
                    date.textContent = img.date || 'No date';
                    
                    header.appendChild(badge);
                    header.appendChild(date);
                    card.appendChild(header);
                    
                    const imgElement = document.createElement('img');
                    imgElement.src = img.data;
                    imgElement.style.cssText = `
                        width: 100%;
                        height: 150px;
                        object-fit: cover;
                        border-radius: 8px;
                        margin-bottom: 15px;
                        border: 1px solid #eee;
                    `;
                    card.appendChild(imgElement);
                    
                    if (img.caption) {
                        const captionDiv = document.createElement('div');
                        captionDiv.style.cssText = `
                            background: #f0f7ff;
                            padding: 12px;
                            border-radius: 8px;
                            margin-bottom: 15px;
                            border-left: 4px solid #007bff;
                        `;
                        
                        const captionLabel = document.createElement('strong');
                        captionLabel.style.cssText = `
                            color: #007bff;
                            display: block;
                            margin-bottom: 5px;
                        `;
                        captionLabel.textContent = '📝 Caption:';
                        
                        const captionText = document.createElement('p');
                        captionText.style.cssText = `
                            margin: 0;
                            color: #333;
                        `;
                        captionText.textContent = img.caption;
                        
                        captionDiv.appendChild(captionLabel);
                        captionDiv.appendChild(captionText);
                        card.appendChild(captionDiv);
                    }
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '🗑️ Delete This Image';
                    deleteBtn.style.cssText = `
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        width: 100%;
                        font-size: 16px;
                        font-weight: bold;
                        transition: background 0.3s;
                    `;
                    
                    deleteBtn.onmouseover = () => { deleteBtn.style.background = '#c82333'; };
                    deleteBtn.onmouseout = () => { deleteBtn.style.background = '#dc3545'; };
                    deleteBtn.onclick = () => deleteImage(index);
                    
                    card.appendChild(deleteBtn);
                    adminList.appendChild(card);
                });
            }
        }
        
    } catch (error) {
        console.error('Gallery error:', error);
        container.innerHTML = "<p style='text-align:center; color:#dc3545;'>Error loading gallery. Check your Master Key.</p>";
    }
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
                <strong style="color:#007bff; display:block; margin-bottom:10px;">Preview:</strong>
                <img src="${e.target.result}" 
                     style="max-width:100%; max-height:200px; border-radius:5px; border:3px solid #007bff;">
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
    messageEl.style.cssText = "margin-top:15px; padding:10px; border-radius:4px;";
    
    if (password !== ADMIN_PASSWORD) {
        messageEl.innerHTML = "❌ Wrong password!";
        messageEl.style.backgroundColor = "#f8d7da";
        messageEl.style.color = "#721c24";
        return;
    }
    
    if (!selectedImage) {
        messageEl.innerHTML = "❌ Select an image first!";
        messageEl.style.backgroundColor = "#f8d7da";
        messageEl.style.color = "#721c24";
        return;
    }
    
    try {
        messageEl.innerHTML = "⏳ Uploading...";
        messageEl.style.backgroundColor = "#cce5ff";
        messageEl.style.color = "#004085";
        
        uploadBtn.disabled = true;
        uploadBtn.textContent = "⏳ Uploading...";
        uploadBtn.style.background = '#6c757d';
        
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
            
            if (!getRes.ok) throw new Error('Failed to fetch current images');
            
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
                
                uploadBtn.textContent = "📤 Upload Image";
                uploadBtn.style.background = '#28a745';
                uploadBtn.disabled = true;
                selectedImage = null;
                
                messageEl.innerHTML = "✅ Image uploaded successfully!";
                messageEl.style.backgroundColor = "#d4edda";
                messageEl.style.color = "#155724";
                
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
        messageEl.style.backgroundColor = "#f8d7da";
        messageEl.style.color = "#721c24";
        
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
    messageEl.style.cssText = "margin-top:15px; padding:10px; border-radius:4px;";
    
    if (password !== ADMIN_PASSWORD) {
        messageEl.innerHTML = "❌ Enter password first!";
        messageEl.style.backgroundColor = "#f8d7da";
        messageEl.style.color = "#721c24";
        return;
    }
    
    if (!confirm("🗑️ Delete this image?")) return;
    
    try {
        const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        if (!getRes.ok) throw new Error('Failed to fetch images');
        
        const data = await getRes.json();
        const images = data.images || [];
        
        images.splice(index, 1);
        
        const putRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify({ images: images })
        });
        
        if (putRes.ok) {
            messageEl.innerHTML = "✅ Image deleted!";
            messageEl.style.backgroundColor = "#d4edda";
            messageEl.style.color = "#155724";
            
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
        messageEl.style.backgroundColor = "#f8d7da";
        messageEl.style.color = "#721c24";
    }
};

// ============ INITIALIZE EVERYTHING ============
document.addEventListener("DOMContentLoaded", function() {
    // Load announcements if element exists
    if (document.getElementById("announcement-list")) {
        loadAnnouncements();
    }
    
    // Load gallery if element exists
    if (document.getElementById("gallery-container")) {
        loadGallery();
    }
    
    // Add global styles
    const style = document.createElement('style');
    style.textContent = `
        .admin-panel {
            background: #f8f9fa;
            padding: 30px;
            margin: 30px auto;
            border-radius: 12px;
            max-width: 800px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .admin-panel h2 {
            color: #333;
            margin-bottom: 25px;
            text-align: center;
            font-size: 28px;
        }
        
        .admin-panel input,
        .admin-panel textarea,
        .admin-panel input[type="file"] {
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border 0.3s;
        }
        
        .admin-panel input:focus,
        .admin-panel textarea:focus {
            border-color: #007bff;
            outline: none;
        }
        
        .admin-panel button {
            padding: 12px 25px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-right: 10px;
            transition: background 0.3s;
        }
        
        .admin-panel button:hover {
            background: #0056b3;
        }
        
        .admin-panel .clear-btn {
            background: #dc3545;
        }
        
        .admin-panel .clear-btn:hover {
            background: #c82333;
        }
        
        .image-upload-section {
            background: white;
            padding: 25px;
            margin: 20px 0;
            border-radius: 10px;
            border: 2px dashed #007bff;
        }
        
        .image-upload-section h3 {
            color: #007bff;
            margin-top: 0;
            margin-bottom: 20px;
            text-align: center;
        }
        
        #imagePreview {
            margin: 15px 0;
            text-align: center;
        }
        
        .current-images {
            margin-top: 30px;
        }
        
        .current-images h3 {
            color: #333;
            margin-bottom: 20px;
        }
        
        #galleryMessage {
            margin-top: 20px;
        }
        
        #gallery-container {
            min-height: 200px;
        }
    `;
    document.head.appendChild(style);
});
// ============ SCREENSHOT PROTECTION ============

// 1. Disable right-click completely
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// 2. Disable common keyboard shortcuts for screenshots/dev tools
document.addEventListener('keydown', function(e) {
    // Disable Print Screen (PrtScn)
    if (e.key === 'PrintScreen') {
        e.preventDefault();
        alert('📸 Screenshots are disabled on this site');
        return false;
    }
    
    // Disable Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        alert('🛠️ Developer tools are disabled');
        return false;
    }
    
    // Disable Ctrl+Shift+J (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
    }
    
    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        alert('🔍 View source is disabled');
        return false;
    }
    
    // Disable Ctrl+S (Save)
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        alert('💾 Save is disabled');
        return false;
    }
    
    // Disable Ctrl+P (Print)
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        alert('🖨️ Print is disabled');
        return false;
    }
    
    // Disable Ctrl+Shift+C (Inspect)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
    }
    
    // Disable F12 (DevTools)
    if (e.key === 'F12') {
        e.preventDefault();
        alert('🛠️ Developer tools are disabled');
        return false;
    }
});

// 3. Detect DevTools opening (advanced)
(function() {
    const devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    
    setInterval(function() {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            if (!devtools.open) {
                devtools.open = true;
                document.body.innerHTML = '<h1 style="color:red; text-align:center; margin-top:50px;">🚫 Developer tools detected. Please close them to continue.</h1>';
            }
        } else {
            devtools.open = false;
        }
    }, 1000);
})();

// 4. Disable drag and drop of images
document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
    }
});

// 5. Disable copy for images
document.addEventListener('copy', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
    }
});

// 6. Add CSS protection
const style = document.createElement('style');
style.textContent = `
    /* Prevent image selection */
    img {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        pointer-events: none;
    }
    
    /* Add overlay effect on images */
    .gallery-image, .announcement-item img {
        position: relative;
    }
    
    .gallery-image::after, .announcement-item img::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        z-index: 999;
    }
    
    /* Disable text selection */
    body {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    
    /* Blur images slightly when printing */
    @media print {
        body { display: none; }
        img { display: none; }
        .gallery-container { display: none; }
    }
`;
document.head.appendChild(style);

// 7. Add watermark overlay to gallery images (optional)
function addWatermarkToImages() {
    const galleryImages = document.querySelectorAll('.gallery-image img');
    galleryImages.forEach(img => {
        const watermark = document.createElement('div');
        watermark.textContent = '© Naked Live Babes';
        watermark.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 10px;
            color: rgba(255,255,255,0.5);
            font-size: 12px;
            background: rgba(0,0,0,0.3);
            padding: 2px 5px;
            border-radius: 3px;
            pointer-events: none;
            z-index: 1000;
        `;
        
        if (img.parentElement.style.position !== 'relative') {
            img.parentElement.style.position = 'relative';
        }
        
        img.parentElement.appendChild(watermark);
    });
}

// 8. Blur images slightly when window loses focus (user might be screenshotting)
window.addEventListener('blur', function() {
    document.querySelectorAll('img').forEach(img => {
        img.style.filter = 'blur(5px)';
        img.style.transition = 'filter 0.3s';
    });
});

window.addEventListener('focus', function() {
    document.querySelectorAll('img').forEach(img => {
        img.style.filter = 'none';
    });
});

// 9. Disable right-click specifically on images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        alert('📸 Saving images is disabled');
        return false;
    });
});

console.log('🔒 Screenshot protection enabled');
