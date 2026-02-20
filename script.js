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
// ============ AUDIO ANNOUNCEMENTS ============
let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioUrl;

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
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
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
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
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

// Update the displayAnnouncements function to show audio
function displayAnnouncements(announcements) {
    const list = document.getElementById("announcement-list");
    const audioList = document.getElementById("audio-announcement-list");
    
    if (!list) return;
    
    list.innerHTML = "";
    if (audioList) audioList.innerHTML = "";
    
    if (announcements.length === 0) {
        list.innerHTML = "<p>No announcements yet.</p>";
        return;
    }
    
    let textCount = 0;
    let audioCount = 0;
    
    announcements.forEach(item => {
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
                div.innerHTML += `<div class="audio-controls"><small>Size: ${item.duration}</small></div>`;
                
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

// Add recording indicator
function addRecordingStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .recording {
            animation: pulse 1s infinite;
            background-color: #ff4444 !important;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }
        
        .audio-player {
            width: 100%;
            margin: 10px 0;
            border-radius: 30px;
        }
        
        .audio-announcement-item {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .audio-announcement-item .audio-info span {
            color: white;
        }
        
        .audio-announcement-item small {
            color: rgba(255,255,255,0.8) !important;
        }
    `;
    document.head.appendChild(style);
}

// Initialize audio features
document.addEventListener("DOMContentLoaded", function () {
    addStyles();
    addRecordingStyles();
    loadAnnouncements();
    
    // Check microphone permissions on page load
    if (navigator.permissions) {
        navigator.permissions.query({ name: 'microphone' }).then(function(permissionStatus) {
            console.log('Microphone permission:', permissionStatus.state);
        });
    }
});
