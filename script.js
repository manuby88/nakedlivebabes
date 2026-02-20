// API endpoint (your Netlify URL)
const API_URL = '/.netlify/functions/announcements';

// Load announcements from server
async function loadAnnouncements() {
    const list = document.getElementById("announcement-list");
    if (!list) return;
    
    try {
        const response = await fetch(API_URL);
        const announcements = await response.json();
        
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
        console.error('Error loading announcements:', error);
        list.innerHTML = "<p>Error loading announcements. Please refresh.</p>";
    }
}

// Check password and post
async function checkPasswordAndPost() {
    const password = document.getElementById("adminPass").value;
    const text = document.getElementById("announcementText").value;
    const messageEl = document.getElementById("adminMessage");
    
    if (text.trim() === "") {
        showMessage("❌ Please enter an announcement!", "error");
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: text,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
            showMessage("❌ Incorrect password!", "error");
            return;
        }
        
        if (response.ok) {
            document.getElementById("announcementText").value = "";
            document.getElementById("adminPass").value = "";
            showMessage("✅ Announcement posted successfully!", "success");
            loadAnnouncements();
        }
    } catch (error) {
        showMessage("❌ Error posting announcement", "error");
    }
}

// Clear all announcements
async function clearAnnouncements() {
    const password = document.getElementById("adminPass").value;
    const messageEl = document.getElementById("adminMessage");
    
    if (!password) {
        showMessage("❌ Please enter password!", "error");
        return;
    }
    
    if (!confirm("Are you sure you want to delete ALL announcements?")) {
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password })
        });
        
        if (response.status === 401) {
            showMessage("❌ Incorrect password!", "error");
            return;
        }
        
        if (response.ok) {
            showMessage("✅ All announcements cleared!", "success");
            loadAnnouncements();
        }
    } catch (error) {
        showMessage("❌ Error clearing announcements", "error");
    }
}

// Helper function to show messages
function showMessage(text, type) {
    const messageEl = document.getElementById("adminMessage");
    messageEl.textContent = text;
    messageEl.className = type;
    
    setTimeout(() => {
        messageEl.textContent = "";
        messageEl.className = "";
    }, 3000);
}

// Add CSS styles
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .announcement-item {
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .announcement-item p {
            margin: 0 0 10px 0;
            font-size: 16px;
        }
        
        .announcement-item small {
            color: #6c757d;
            font-size: 12px;
        }
        
        .admin-panel {
            background: #f0f0f0;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
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
            background: #dc3545 !important;
        }
        
        .admin-panel button:hover {
            opacity: 0.9;
        }
        
        #adminMessage {
            margin-top: 10px;
            padding: 10px;
            border-radius: 4px;
        }
        
        #adminMessage.error {
            background: #f8d7da;
            color: #721c24;
        }
        
        #adminMessage.success {
            background: #d4edda;
            color: #155724;
        }
    `;
    document.head.appendChild(style);
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
    addStyles();
    loadAnnouncements();
});
