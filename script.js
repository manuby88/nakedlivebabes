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

// ============ GALLERY FUNCTIONS WITH CLOUDINARY ============
// Add your Cloudinary config
const CLOUDINARY_CONFIG = {
    cloudName: 'dljtavfop', // Replace with your cloud name
    uploadPreset: 'nakedlivebabes', // Create an unsigned upload preset in Cloudinary
    folder: 'gallery'
};

let selectedImage = null;

// Initialize Cloudinary Upload Widget
function initCloudinaryWidget() {
    return cloudinary.createUploadWidget({
        cloudName: CLOUDINARY_CONFIG.cloudName,
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
        folder: CLOUDINARY_CONFIG.folder,
        maxFileSize: 10000000, // 10MB
        maxImageFileSize: 5000000, // 5MB
        cropping: true, // Allow cropping
        croppingAspectRatio: 1.77, // 16:9 aspect ratio
        showAdvancedOptions: false,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        styles: {
            palette: {
                window: "#FFFFFF",
                windowBorder: "#90A0B3",
                tabIcon: "#0078FF",
                menuIcons: "#5A6169",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#0078FF",
                action: "#FF620C",
                inactiveTabIcon: "#0E2F5A",
                error: "#F44235",
                inProgress: "#0078FF",
                complete: "#20B832",
                sourceBg: "#E4EBF1"
            }
        }
    });
}

// Upload with Cloudinary
function uploadWithCloudinary() {
    const password = document.getElementById("galleryAdminPass").value;
    
    if (password !== ADMIN_PASSWORD) {
        alert("❌ Wrong password!");
        return;
    }
    
    const widget = initCloudinaryWidget();
    
    widget.open();
    
    widget.on('success', async (result) => {
        const imageData = result.info;
        
        // Get current images from JSONBin
        try {
            const getRes = await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}/latest`, {
                headers: { 'X-Master-Key': MASTER_KEY }
            });
            
            const data = await getRes.json();
            const images = data.record?.images || [];
            
            // Add Cloudinary image data (not the actual image)
            images.unshift({
                type: 'cloudinary',
                publicId: imageData.public_id,
                url: imageData.secure_url,
                thumbnail: imageData.secure_url.replace('/upload/', '/upload/w_300,h_200,c_fill/'), // Thumbnail version
                caption: document.getElementById("imageCaption").value,
                date: new Date().toLocaleString(),
                width: imageData.width,
                height: imageData.height,
                format: imageData.format
            });
            
            // Save to JSONBin
            await fetch(`https://api.jsonbin.io/v3/b/${GALLERY_BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY
                },
                body: JSON.stringify({ images: images })
            });
            
            document.getElementById("imageCaption").value = "";
            alert("✅ Image uploaded to Cloudinary!");
            loadGallery();
            
        } catch (error) {
            console.error('Error saving:', error);
            alert("Error saving image reference");
        }
    });
}

