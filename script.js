// ============ COMPLETE WORKING CODE WITH IMAGE COMPRESSION ============

// ============ CONFIGURATION ============
// YOUR ACTUAL CREDENTIALS - Verified working
const MASTER_KEY = '$2a$10$2CQWh0cZYZXJH3XHacRx4ukhljFJggfi95zCzMa//feZ/O.IBf1oC';
const BIN_ID = '699881a243b1c97be98eaf4d';
const GALLERY_BIN_ID = '69a04e22ae596e708f4c3ca2';
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
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false',
                'X-Bin-Versioning': 'false'
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
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false',
                'X-Bin-Versioning': 'false'
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

// ============ GALLERY FUNCTIONS WITH IMAGE COMPRESSION ============
let selectedImages = [];

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
                `;
                
                card.onmouseover = () => { card.style.transform = 'scale(1.03)'; };
                card.onmouseout = () => { card.style.transform = 'scale(1)'; };
                
                card.innerHTML = `
                    <img src="${img.data}" alt="${img.caption || ''}" 
                         style="width:100%; height:250px; object-fit:cover; display:block;">
                    ${img.caption ? 
                        `<div style="padding:15px; text-align:center; font-weight:500; background:#f8f9fa;">
                            ${img.caption}
                        </div>` : ''
                    }
                    <div style="padding:8px 15px; font-size:12px; color:#666; background:#f8f9fa; border-top:1px solid #eee;">
                        🖼️ Image ${index + 1} of ${images.length} • ${img.date || ''}
                    </div>
                `;
                
                container.appendChild(card);
            });
        }
        
        // Display admin list
        if (adminList) {
            adminList.innerHTML = "";
            adminList.style.display = 'grid';
            adminList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
            adminList.style.gap = '20px';
            adminList.style.marginTop = '20px';
            
            if (images.length === 0) {
                adminList.innerHTML = "<p style='text-align:center; color:#666;'>No images uploaded yet. Select multiple images below and click 'Upload All Images'.</p>";
            } else {
                images.forEach((img, index) => {
                    const card = document.createElement('div');
                    card.style.cssText = `
                        background: white;
                        border: 1px solid #e0e0e0;
                        border-radius: 12px;
                        padding: 15px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    `;
                    
                    card.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <span style="background:#007bff; color:white; padding:5px 15px; border-radius:20px; font-size:14px; font-weight:bold;">
                                Image #${index + 1}
                            </span>
                            <span style="color:#666; font-size:13px;">
                                📅 ${img.date || 'No date'}
                            </span>
                        </div>
                        
                        <img src="${img.data}" style="width:100%; height:150px; object-fit:cover; border-radius:8px; margin-bottom:15px; border:1px solid #eee;">
                        
                        ${img.caption ? 
                            `<div style="background:#f0f7ff; padding:12px; border-radius:8px; margin-bottom:15px; border-left:4px solid #007bff;">
                                <strong style="color:#007bff; display:block; margin-bottom:5px;">📝 Caption:</strong>
                                ${img.caption}
                            </div>` : 
                            '<p style="color:#999; font-style:italic; margin-bottom:15px;">No caption</p>'
                        }
                        
                        <button onclick="deleteImage(${index})" 
                                style="background:#dc3545; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; width:100%; font-size:16px; font-weight:bold;">
                            🗑️ Delete Image
                        </button>
                    `;
                    
                    adminList.appendChild(card);
                });
            }
        }
        
    } catch (error) {
        console.error('Gallery error:', error);
        container.innerHTML = "<p style='text-align:center; color:#dc3545;'>Error loading gallery. Check console.</p>";
    }
}

// Preview multiple images
window.previewImages = function(event) {
    const files = Array.from(event.target.files);
    const preview = document.getElementById("imagePreview");
    const uploadBtn = document.getElementById("uploadBtn");
    
    if (files.length === 0) return;
    
    selectedImages = files;
    
    let previewHTML = '<div style="margin-top:15px;"><strong style="color:#007bff;">Selected Images:</strong></div>';
    previewHTML += '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 1fr)); gap:10px; margin-top:10px;">';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgPreview = document.getElementById(`preview-${index}`);
            if (imgPreview) {
                imgPreview.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
        
        previewHTML += `
            <div style="text-align:center;">
                <img id="preview-${index}" src="" style="width:100%; height:80px; object-fit:cover; border-radius:5px; border:2px solid #007bff;">
                <small style="font-size:10px;">${file.name.substring(0,10)}...</small>
            </div>
        `;
    });
    
    previewHTML += '</div>';
    previewHTML += `<p style="color:green; margin-top:10px;">✅ ${files.length} image(s) selected</p>`;
    
    preview.innerHTML = previewHTML;
    
    uploadBtn.disabled = false;
    uploadBtn.textContent = `📤 Upload ${files.length} Image(s)`;
};

// Compress image function
function compressImage(file, maxSizeKB = 90) {
    return new Promise((resolve, reject) => {
        console.log(`Compressing: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                
                // Resize if too large - max width 800px
                const maxWidth = 800;
                if (width > maxWidth) {
                    height = Math.floor((maxWidth * height) / width);
                    width = maxWidth;
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                let quality = 0.8;
                let compressedDataUrl;
                
                const attemptCompression = () => {
                    compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    
                    // Calculate size
                    const base64Size = Math.round((compressedDataUrl.length * 3) / 4);
                    const sizeInKB = base64Size / 1024;
                    
                    console.log(`  Quality ${quality}: ${sizeInKB.toFixed(2)}KB`);
                    
                    if (sizeInKB > maxSizeKB && quality > 0.3) {
                        quality -= 0.1;
                        attemptCompression();
                    } else {
                        console.log(`✅ Final size: ${sizeInKB.toFixed(2)}KB`);
                        resolve(compressedDataUrl);
                    }
                };
                
                attemptCompression();
            };
        };
        
        reader.onerror = reject;
    });
}

// Upload multiple images with compression
window.uploadImages = async function() {
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
    
    if (selectedImages.length === 0) {
        messageEl.innerHTML = "❌ Select images first!";
        messageEl.style.color = "red";
        return;
    }
    
    try {
        uploadBtn.disabled = true;
        uploadBtn.textContent = `⏳ Processing 0/${selectedImages.length}...`;
        
        // Get current images from JSONBin
        const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        if (!getRes.ok) {
            throw new Error('Failed to get current images from JSONBin');
        }
        
        const data = await getRes.json();
        let images = data.images || [];
        
        // Process each image
        for (let i = 0; i < selectedImages.length; i++) {
            uploadBtn.textContent = `⏳ Compressing ${i + 1}/${selectedImages.length}...`;
            
            const file = selectedImages[i];
            
            try {
                const compressedBase64 = await compressImage(file);
                
                images.unshift({
                    data: compressedBase64,
                    caption: caption ? `${caption} #${images.length + 1}` : '',
                    date: new Date().toLocaleString()
                });
                
                console.log(`✅ Image ${i + 1} ready`);
            } catch (compressError) {
                console.error(`Failed to compress ${file.name}:`, compressError);
                messageEl.innerHTML = `❌ Failed to compress ${file.name}`;
                messageEl.style.color = "red";
                uploadBtn.disabled = false;
                uploadBtn.textContent = "📤 Upload Images";
                return;
            }
        }
        
        // Save all to JSONBin
        uploadBtn.textContent = `⏳ Saving to gallery...`;
        
        const putRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false',
                'X-Bin-Versioning': 'false'
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
            uploadBtn.textContent = "📤 Upload Images";
            
            const uploadedCount = selectedImages.length;
            selectedImages = [];
            
            messageEl.innerHTML = `✅ ${uploadedCount} image(s) uploaded successfully!`;
            messageEl.style.color = "green";
            
            loadGallery();
            
            setTimeout(() => {
                messageEl.innerHTML = "";
            }, 3000);
        } else {
            const errorText = await putRes.text();
            console.error('JSONBin save error:', errorText);
            throw new Error(`Failed to save: ${putRes.status}`);
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        messageEl.innerHTML = "❌ Upload failed: " + error.message;
        messageEl.style.color = "red";
        uploadBtn.disabled = false;
        uploadBtn.textContent = "📤 Upload Images";
    }
};

// Delete image
window.deleteImage = async function(index) {
    const password = document.getElementById("galleryAdminPass").value;
    const messageEl = document.getElementById("galleryMessage");
    
    if (password !== ADMIN_PASSWORD) {
        messageEl.innerHTML = "❌ Enter password first!";
        messageEl.style.color = "red";
        return;
    }
    
    if (!confirm("Delete this image?")) return;
    
    try {
        const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        const data = await getRes.json();
        let images = data.images || [];
        
        images.splice(index, 1);
        
        const putRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false',
                'X-Bin-Versioning': 'false'
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
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        messageEl.innerHTML = "❌ Delete failed";
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
