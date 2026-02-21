// ============ CONFIGURATION ============
// REPLACE THESE WITH YOUR ACTUAL VALUES FROM JSONBIN.IO
const MASTER_KEY = '$2a$10$/73BHVkiHDdroKUGU7j2JuqgjESyGWvbXU3iU.piqoZTj4uUA4moi';  // Get from jsonbin.io
const BIN_ID = '699881a243b1c97be98eaf4d';          // Your announcement bin ID
const GALLERY_BIN_ID = '6998865f43b1c97be98eba4a'; // Your gallery bin ID
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
        
        // Show images in admin with working delete buttons
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
        div.style.position = "relative";
        div.style.cursor = "pointer";
        
        // Create image
        const imageElement = document.createElement('img');
        imageElement.src = img.data;
        imageElement.style.width = "100%";
        imageElement.style.height = "150px";
        imageElement.style.objectFit = "cover";
        imageElement.style.display = "block";
        
        // Create delete overlay
        const overlay = document.createElement('div');
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.right = "0";
        overlay.style.bottom = "0";
        overlay.style.backgroundColor = "rgba(220, 53, 69, 0.9)";
        overlay.style.color = "white";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.fontSize = "16px";
        overlay.style.fontWeight = "bold";
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity 0.3s";
        overlay.style.borderRadius = "8px";
        overlay.innerHTML = "🗑️ DELETE";
        
        // Hover effects
        div.onmouseenter = () => { overlay.style.opacity = "1"; };
        div.onmouseleave = () => { overlay.style.opacity = "0"; };
        
        // Click to delete
        div.onclick = () => deleteImage(index);
        
        // Add caption if exists
        if (img.caption) {
            const caption = document.createElement('div');
            caption.className = "caption";
            caption.style.position = "absolute";
            caption.style.bottom = "0";
            caption.style.left = "0";
            caption.style.right = "0";
            caption.style.backgroundColor = "rgba(0,0,0,0.7)";
            caption.style.color = "white";
            caption.style.padding = "5px";
            caption.style.fontSize = "12px";
            caption.style.textAlign = "center";
            caption.style.zIndex = "1";
            caption.textContent = img.caption;
            div.appendChild(caption);
        }
        
        div.appendChild(imageElement);
        div.appendChild(overlay);
        list.appendChild(div);
    });
}
