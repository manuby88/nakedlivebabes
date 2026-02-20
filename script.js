const password = "admin123";

function loadAnnouncements() {
    const list = document.getElementById("announcement-list");
    list.innerHTML = "";

    let announcements = JSON.parse(localStorage.getItem("announcements")) || [];

    announcements.forEach(text => {
        const div = document.createElement("div");
        div.className = "announcement-item";
        div.innerText = text;
        list.appendChild(div);
    });
}

function loadAnnouncements() {
    const container = document.getElementById("announcementContainer");
    if (!container) return;  // stop if section doesn't exist

    container.innerHTML = ""; 
}

    if (text.trim() === "") return;

    let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
    announcements.push(text);
    localStorage.setItem("announcements", JSON.stringify(announcements));

    document.getElementById("announcementText").value = "";
    loadAnnouncements();
}

document.addEventListener("DOMContentLoaded", function () {
    loadAnnouncements();
});
