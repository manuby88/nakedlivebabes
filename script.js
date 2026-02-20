const password = "admin123";

function loadAnnouncements() {
    const list = document.getElementById("announcement-list");
    if (!list) return; // stop if element doesn't exist
    
    list.innerHTML = "";

    let announcements = JSON.parse(localStorage.getItem("announcements")) || [];

    announcements.forEach(text => {
        const div = document.createElement("div");
        div.className = "announcement-item";
        div.innerText = text;
        list.appendChild(div);
    });
}

function addAnnouncement() {
    const text = document.getElementById("announcementText").value;
    
    if (text.trim() === "") return;

    let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
    announcements.push(text);
    localStorage.setItem("announcements", JSON.stringify(announcements));

    document.getElementById("announcementText").value = "";
    loadAnnouncements();
}

function clearAnnouncements() {
    if (confirm("Are you sure you want to clear all announcements?")) {
        localStorage.removeItem("announcements");
        loadAnnouncements();
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadAnnouncements();
    
    // Add event listener for add button if it exists
    const addButton = document.getElementById("addAnnouncementBtn");
    if (addButton) {
        addButton.addEventListener("click", addAnnouncement);
    }
    
    // Add event listener for clear button if it exists
    const clearButton = document.getElementById("clearAnnouncementsBtn");
    if (clearButton) {
        clearButton.addEventListener("click", clearAnnouncements);
    }
});
