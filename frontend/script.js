const video = document.getElementById("video");

// Start camera
if (video) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("Camera access denied:", err);
            showToast("Camera access denied or unavailable", "error");
        });
}

function captureImage(callback) {
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(callback, "image/jpeg");
}

// Toast notification helper
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    // Trigger reflow for transition
    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Update button state helper
function setButtonLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerText;
        btn.innerText = "Processing...";
    } else {
        btn.disabled = false;
        if (btn.dataset.originalText) {
            btn.innerText = btn.dataset.originalText;
        }
    }
}

function register() {
    let nameInput = document.getElementById("name");
    let name = nameInput ? nameInput.value.trim() : "";
    
    if (!name) {
        showToast("Please enter a name first.", "error");
        return;
    }

    setButtonLoading("btn-register", true);

    captureImage(blob => {
        let form = new FormData();
        form.append("name", name);
        form.append("image", blob);

        fetch("http://127.0.0.1:5000/register", {
            method: "POST",
            body: form
        })
        .then(res => res.text())
        .then(data => {
            if (data === "Student Registered") {
                showToast(data, "success");
                nameInput.value = ""; // clear input
            } else {
                showToast(data, "error");
            }
        })
        .catch(err => {
            console.error(err);
            showToast("Server error. Is the backend running?", "error");
        })
        .finally(() => setButtonLoading("btn-register", false));
    });
}

function verify() {
    setButtonLoading("btn-verify", true);

    captureImage(blob => {
        let form = new FormData();
        form.append("image", blob);

        fetch("http://127.0.0.1:5000/verify", {
            method: "POST",
            body: form
        })
        .then(res => res.text())
        .then(data => {
            if (data === "No face detected" || data === "Unknown") {
                showToast(data, "error");
            } else {
                showToast("Hello " + data + ", attendance marked!", "success");
            }
        })
        .catch(err => {
            console.error(err);
            showToast("Server error. Is the backend running?", "error");
        })
        .finally(() => setButtonLoading("btn-verify", false));
    });
}

// Background detection (only if we are on the exam page)
if (window.location.pathname.includes("exam.html")) {
    setInterval(() => {
        if (!video.srcObject) return; // wait for camera
        captureImage(blob => {
            let form = new FormData();
            form.append("image", blob);

            fetch("http://127.0.0.1:5000/detect", {
                method: "POST",
                body: form
            })
            .then(res => res.text())
            .then(data => {
                if (data !== "Normal") {
                    showToast("Warning: " + data, "error");
                }
            })
            .catch(console.error);
        });
    }, 5000);
}

// Tab switch tracking
document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        fetch("http://127.0.0.1:5000/log_tab", { method: "POST" })
            .catch(console.error);
    }
});