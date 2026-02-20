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
// Post text announcement
async function postAnnouncement() {
    console.log("postAnnouncement function called!"); // DEBUG
    
    const password = document.getElementById("adminPass").value;
    const message = document.getElementById("announcementText").value;
    const messageEl = document.getElementById("adminMessage");
    
    console.log("Password:", password); // DEBUG
    console.log("Message:", message); // DEBUG
    
    // Clear previous messages
    messageEl.textContent = "";
    messageEl.className = "";
    
    // Check if message is empty
    if (!message.trim()) {
        console.log("Message is empty"); // DEBUG
        showMessage("❌ Please enter an announcement!", "error");
        return;
    }
    
    // Check password
    if (password !== ADMIN_PASSWORD) {
        console.log("Wrong password"); // DEBUG
        showMessage("❌ Incorrect password! Try 'admin123'", "error");
        return;
    }
    
    console.log("Password correct, proceeding..."); // DEBUG
    
    try {
        showMessage("⏳ Posting text announcement...", "info");
        
        // Get current announcements
        console.log("Fetching from JSONBin..."); // DEBUG
        const getResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': MASTER_KEY,
                'X-Access-Key': API_KEY
            }
        });
        
        if (!getResponse.ok) {
            console.error("Fetch failed:", getResponse.status); // DEBUG
            throw new Error('Failed to fetch current announcements');
        }
        
        const data = await getResponse.json();
        console.log("Current data:", data); // DEBUG
        
        const announcements = data.record.announcements || [];
        console.log("Current announcements:", announcements); // DEBUG
        
        // Add new text announcement at the beginning
        announcements.unshift({
            type: 'text',
            message: message.trim(),
            date: new Date().toLocaleString()
        });
        
        console.log("Updated announcements:", announcements); // DEBUG
        
        // Update on JSONBin
        const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY,
                'X-Access-Key': API_KEY
            },
            body: JSON.stringify({ announcements: announcements })
        });
        
        console.log("Update response status:", updateResponse.status); // DEBUG
        
        if (!updateResponse.ok) {
            throw new Error('Failed to save announcement');
        }
        
        // Clear input fields
        document.getElementById("announcementText").value = "";
        document.getElementById("adminPass").value = "";
        
        showMessage("✅ Text announcement posted successfully!", "success");
        console.log("Announcement posted successfully!"); // DEBUG
        
        // Reload announcements
        await loadAnnouncements();
        
    } catch (error) {
        console.error('Error posting announcement:', error);
        showMessage("❌ Error posting announcement. Check console.", "error");
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

// Simple WhatsApp contact form
function sendToWhatsApp(event) {
    event.preventDefault();
    
    // Get values
    const name = document.getElementById('fullName').value;
    const phone = document.getElementById('phoneNumber').value;
    const date = document.getElementById('date').value;
    const message = document.getElementById('message').value;
    
    // Create message
    const text = `Name: ${name}%0APhone: ${phone}%0ADate: ${date}%0AMessage: ${message}`;
    
    // Send to WhatsApp
    window.open(`https://wa.me/256784340888?text=${text}`, '_blank');
    
    // Reset form
    event.target.reset();
}
// ============ TEXT ANNOUNCEMENTS ============

// Post text announcement
async function postAnnouncement() {
    const password = document.getElementById("adminPass").value;
    const message = document.getElementById("announcementText").value;
    const messageEl = document.getElementById("adminMessage");
    
    // Clear previous messages
    messageEl.textContent = "";
    messageEl.className = "";
    
    // Check if message is empty
    if (!message.trim()) {
        showMessage("❌ Please enter an announcement!", "error");
        return;
    }
    
    // Check password
    if (password !== ADMIN_PASSWORD) {
        showMessage("❌ Incorrect password! Try 'admin123'", "error");
        return;
    }
    
    try {
        showMessage("⏳ Posting text announcement...", "info");
        
        // Get current announcements
        const getResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': MASTER_KEY,
                'X-Access-Key': API_KEY
            }
        });
        
        if (!getResponse.ok) {
            throw new Error('Failed to fetch current announcements');
        }
        
        const data = await getResponse.json();
        const announcements = data.record.announcements || [];
        
        // Add new text announcement at the beginning
        announcements.unshift({
            type: 'text',
            message: message.trim(),
            date: new Date().toLocaleString()
        });
        
        // Update on JSONBin
        const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY,
                'X-Access-Key': API_KEY
            },
            body: JSON.stringify({ announcements: announcements })
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to save announcement');
        }
        
        // Clear input fields
        document.getElementById("announcementText").value = "";
        document.getElementById("adminPass").value = "";
        
        showMessage("✅ Text announcement posted successfully!", "success");
        
        // Reload announcements
        await loadAnnouncements();
        
    } catch (error) {
        console.error('Error posting announcement:', error);
        showMessage("❌ Error posting announcement. Check console.", "error");
    }
}

// ============ AUDIO ANNOUNCEMENTS ============
let mediaRecorder;
let audioChunks = [];
let audioBlob = null;
let audioUrl = null;

// Check if browser supports audio recording
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("Audio recording supported");
} else {
    console.log("Audio recording not supported");
}

// Start recording
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioUrl = URL.createObjectURL(audioBlob);
            
            // Enable play button
            document.getElementById('playBtn').disabled = false;
            
            // Show success message
            showMessage("✅ Audio recorded successfully! Click 'Upload Audio' to post.", "success");
        };
        
        mediaRecorder.start();
        
        // Update button states
        document.getElementById('recordBtn').classList.add('recording');
        document.getElementById('recordBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('playBtn').disabled = true;
        
        showMessage("⏺️ Recording... Click Stop when finished.", "info");
        
    } catch (err) {
        console.error('Error accessing microphone:', err);
        showMessage("❌ Could not access microphone. Please check permissions.", "error");
    }
}

// Stop recording
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        
        // Stop all audio tracks
        if (mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        // Update button states
        document.getElementById('recordBtn').classList.remove('recording');
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
    }
}

// Play recording
function playRecording() {
    if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
    }
}

// Handle uploaded audio file
function handleAudioUpload(event) {
    const file = event.target.files[0];
    if (file) {
        audioBlob = file;
        audioUrl = URL.createObjectURL(file);
        document.getElementById('playBtn').disabled = false;
        showMessage(`✅ File "${file.name}" loaded. Click 'Upload Audio' to post.`, "success");
    }
}

// Upload audio announcement
async function uploadAudio() {
    const password = document.getElementById("adminPass").value;
    const messageEl = document.getElementById("adminMessage");
    
    // Check password
    if (password !== ADMIN_PASSWORD) {
        showMessage("❌ Incorrect password!", "error");
        return;
    }
    
    // Check if audio exists
    if (!audioBlob) {
        showMessage("❌ Please record or upload an audio first!", "error");
        return;
    }
    
    try {
        showMessage("⏳ Uploading audio...", "info");
        
        // Convert audio to base64 for storage
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        
        reader.onloadend = async function() {
            const base64Audio = reader.result;
            
            // Get current announcements
            const getResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
                headers: {
                    'X-Master-Key': MASTER_KEY,
                    'X-Access-Key': API_KEY
                }
            });
            
            if (!getResponse.ok) {
                throw new Error('Failed to fetch current announcements');
            }
            
            const data = await getResponse.json();
            const announcements = data.record.announcements || [];
            
            // Add new audio announcement
            announcements.unshift({
                type: 'audio',
                audioData: base64Audio,
                date: new Date().toLocaleString(),
                duration: audioBlob.size ? `${Math.round(audioBlob.size / 1024)}KB` : 'Unknown'
            });
            
            // Update on JSONBin
            const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY,
                    'X-Access-Key': API_KEY
                },
                body: JSON.stringify({ announcements: announcements })
            });
            
            if (updateResponse.ok) {
                // Clear audio
                audioBlob = null;
                audioUrl = null;
                document.getElementById('audioFile').value = '';
                document.getElementById('playBtn').disabled = true;
                document.getElementById('adminPass').value = '';
                
                showMessage("✅ Audio announcement posted successfully!", "success");
                loadAnnouncements(); // Reload to show audio
            }
        };
        
    } catch (error) {
        console.error('Error uploading audio:', error);
        showMessage("❌ Error uploading audio", "error");
    }
}

// Load and display announcements
async function loadAnnouncements() {
    const list = document.getElementById("announcement-list");
    const audioList = document.getElementById("audio-announcement-list");
    
    if (!list) return;
    
    try {
        list.innerHTML = "<p>Loading announcements...</p>";
        if (audioList) audioList.innerHTML = "<p>Loading audio announcements...</p>";
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': MASTER_KEY,
                'X-Access-Key': API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load announcements');
        }
        
        const data = await response.json();
        const announcements = data.record.announcements || [];
        
        displayAnnouncements(announcements);
    } catch (error) {
        console.error('Error loading announcements:', error);
        list.innerHTML = "<p>Error loading announcements. Please refresh.</p>";
        if (audioList) audioList.innerHTML = "<p>Error loading audio announcements.</p>";
    }
}

// Display announcements in the list
function displayAnnouncements(announcements) {
    const list = document.getElementById("announcement-list");
    const audioList = document.getElementById("audio-announcement-list");
    
    if (!list) return;
    
    list.innerHTML = "";
    if (audioList) audioList.innerHTML = "";
    
    if (announcements.length === 0) {
        list.innerHTML = "<p>No announcements yet.</p>";
        if (audioList) audioList.innerHTML = "<p>No audio announcements yet.</p>";
        return;
    }
    
    let textCount = 0;
    let audioCount = 0;
    
    // Reverse to show newest first
    announcements.slice().reverse().forEach(item => {
        if (item.type === 'audio') {
            // Audio announcement
            audioCount++;
            if (audioList) {
                const div = document.createElement("div");
                div.className = "audio-announcement-item";
                
                // Create audio player
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.className = "audio-player";
                audio.src = item.audioData;
                
                div.innerHTML = `
                    <div class="audio-info">
                        <span class="audio-title">🎤 Audio Announcement</span>
                        <span class="audio-date">${item.date}</span>
                    </div>
                `;
                div.appendChild(audio);
                div.innerHTML += `<div class="audio-controls"><small>Size: ${item.duration || 'Unknown'}</small></div>`;
                
                audioList.appendChild(div);
            }
        } else {
            // Text announcement
            textCount++;
            const div = document.createElement("div");
            div.className = "announcement-item";
            div.innerHTML = `
                <p>${item.message || item}</p>
                <small>Posted: ${item.date || new Date().toLocaleString()}</small>
            `;
            list.appendChild(div);
        }
    });
    
    // Show messages if no announcements of a type
    if (textCount === 0) {
        list.innerHTML = "<p>No text announcements yet.</p>";
    }
    if (audioList && audioCount === 0) {
        audioList.innerHTML = "<p>No audio announcements yet.</p>";
    }
}

// Clear all announcements
async function clearAnnouncements() {
    const password = document.getElementById("adminPass").value;
    const messageEl = document.getElementById("adminMessage");
    
    // Clear previous messages
    messageEl.textContent = "";
    messageEl.className = "";
    
    // Check password
    if (password !== ADMIN_PASSWORD) {
        showMessage("❌ Incorrect password!", "error");
        return;
    }
    
    if (!confirm("⚠️ Are you sure you want to delete ALL announcements?")) {
        return;
    }
    
    try {
        showMessage("⏳ Clearing announcements...", "info");
        
        // Update with empty announcements array
        const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY,
                'X-Access-Key': API_KEY
            },
            body: JSON.stringify({ announcements: [] })
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to clear announcements');
        }
        
        // Clear password field
        document.getElementById("adminPass").value = "";
        document.getElementById("announcementText").value = "";
        
        // Clear audio
        audioBlob = null;
        audioUrl = null;
        document.getElementById('audioFile').value = '';
        document.getElementById('playBtn').disabled = true;
        
        showMessage("✅ All announcements cleared!", "success");
        
        // Reload announcements
        await loadAnnouncements();
        
    } catch (error) {
        console.error('Error clearing announcements:', error);
        showMessage("❌ Error clearing announcements", "error");
    }
}

// Helper function to show messages
function showMessage(text, type) {
    const messageEl = document.getElementById("adminMessage");
    if (!messageEl) return;
    
    messageEl.textContent = text;
    messageEl.className = type;
    
    // Auto-hide success/error messages after 5 seconds
    if (type !== 'info') {
        setTimeout(() => {
            if (messageEl.textContent === text) {
                messageEl.textContent = "";
                messageEl.className = "";
            }
        }, 5000);
    }
}

// Add CSS styles
function addStyles() {
    // Check if styles already exist
    if (document.getElementById('announcement-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'announcement-styles';
    style.textContent = `
        .announcement-item {
            background: #ffffff;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .announcement-item p {
            margin: 0 0 10px 0;
            font-size: 16px;
            color: #333;
        }
        
        .announcement-item small {
            color: #666;
            font-size: 12px;
        }
        
        .audio-announcement-item {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .audio-announcement-item .audio-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            color: white;
        }
        
        .audio-announcement-item .audio-title {
            font-weight: bold;
        }
        
        .audio-announcement-item .audio-date {
            font-size: 14px;
            color: rgba(255,255,255,0.8);
        }
        
        .audio-player {
            width: 100%;
            margin: 10px 0;
            border-radius: 30px;
        }
        
        .audio-controls small {
            color: rgba(255,255,255,0.8);
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
            margin-bottom: 10px;
        }
        
        .clear-btn {
            background: #dc3545 !important;
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
        
        #adminMessage.info {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .recording {
            animation: pulse 1s infinite;
            background-color: #dc3545 !important;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }
        
        .audio-upload-section {
            background: #e9ecef;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        
        .audio-upload-section h3 {
            margin-top: 0;
            color: #333;
        }
        
        .audio-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        
        .audio-controls button {
            flex: 1;
            min-width: 100px;
        }
        
        #recordBtn {
            background: #dc3545;
        }
        
        #stopBtn {
            background: #6c757d;
        }
        
        #playBtn {
            background: #28a745;
        }
        
        #audioFile {
            margin: 15px 0;
            padding: 10px;
            border: 2px dashed #007bff;
            border-radius: 5px;
            width: 100%;
        }
        
        #uploadAudioBtn {
            background: #007bff;
            width: 100%;
        }
    `;
    document.head.appendChild(style);
}

// Initialize everything when page loads
document.addEventListener("DOMContentLoaded", function () {
    addStyles();
    loadAnnouncements();
    
    // Add event listener for Enter key in password field
    const passInput = document.getElementById("adminPass");
    if (passInput) {
        passInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                postAnnouncement();
            }
        });
    }
    
    // Add event listener for Enter key in textarea (Ctrl+Enter to post)
    const textInput = document.getElementById("announcementText");
    if (textInput) {
        textInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter" && e.ctrlKey) {
                postAnnouncement();
            }
        });
    }
});


