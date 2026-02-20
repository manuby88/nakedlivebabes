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

