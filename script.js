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

function addAnnouncement() {
    const pass = document.getElementById("adminPass").value;
    const text = document.getElementById("announcementText").value;

    if (pass !== password) {
        alert("Wrong Password");
        return;
    }

    if (text.trim() === "") return;

    let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
    announcements.push(text);
    localStorage.setItem("announcements", JSON.stringify(announcements));

    document.getElementById("announcementText").value = "";
    loadAnnouncements();
}

loadAnnouncements();
