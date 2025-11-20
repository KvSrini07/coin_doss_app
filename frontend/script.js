const API_BASE = "http://127.0.0.1:8000/api/v1";

// UI Elements
const tossBtn = document.getElementById("tossBtn");
const coin = document.getElementById("coin");
const resultBox = document.getElementById("result");
const historyList = document.getElementById("historyList");
const flipSound = document.getElementById("flipSound");

// Auth UI
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const modalSubmit = document.getElementById("modalSubmit");
const modalClose = document.getElementById("modalClose");
const showLogin = document.getElementById("showLogin");
const showRegister = document.getElementById("showRegister");
const logoutBtn = document.getElementById("logoutBtn");

let isRegister = false;

// Token helpers
function getToken() { return localStorage.getItem("token"); }
function setToken(t) { localStorage.setItem("token", t); updateAuthUI(); }
function clearToken() { localStorage.removeItem("token"); updateAuthUI(); }

// Update auth UI
function updateAuthUI() {
    const token = getToken();

    if (token) {
        showLogin.style.display = "none";
        showRegister.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        showLogin.style.display = "inline-block";
        showRegister.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
}

// Auth modal events
showLogin.addEventListener("click", () => {
    isRegister = false;
    modalTitle.textContent = "Login";
    modal.classList.remove("hidden");
});

showRegister.addEventListener("click", () => {
    isRegister = true;
    modalTitle.textContent = "Register";
    modal.classList.remove("hidden");
});

modalClose.addEventListener("click", () => {
    modal.classList.add("hidden");
});

logoutBtn.addEventListener("click", () => {
    clearToken();
    historyList.innerHTML = "Please login to view your history";
});

// Login / Register submit
modalSubmit.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        alert("Enter username and password");
        return;
    }

    try {
        if (isRegister) {
            // REGISTER
            const res = await fetch(API_BASE + "/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) throw new Error("Register failed");

            alert("Registered successfully! Please login.");
            modal.classList.add("hidden");

        } else {
            // LOGIN
            const res = await fetch(API_BASE + "/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) throw new Error("Login failed");

            const data = await res.json();
            setToken(data.access_token);

            modal.classList.add("hidden");
            usernameInput.value = "";
            passwordInput.value = "";

            // load history after login
            loadHistory();
        }

    } catch (err) {
        alert(err.message);
    }
});

// Toggle password visibility

togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "🙈"; // change icon
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = "👁️"; // change back
    }
});


// Load history for current user
async function loadHistory() {
    const token = getToken();

    if (!token) {
        historyList.innerText = "Please login to view your history";
        return;
    }

    try {
        const res = await fetch(API_BASE + "/history/", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            historyList.innerText = "Unauthorized. Please login again.";
            clearToken();
            return;
        }

        const arr = await res.json();

        if (!arr.length) {
            historyList.innerText = "No records yet";
            return;
        }

        historyList.innerHTML = arr.map(
            x => `
                <div class="history-item">
                    <div>${new Date(x.created_at).toLocaleString()}</div>
                    <div>${x.result}</div>
                </div>
            `
        ).join("");

    } catch (error) {
        historyList.innerText = "Error loading history";
    }
}

// Toss event
tossBtn.addEventListener("click", async () => {
    try {
        flipSound.currentTime = 0;
        flipSound.play();
    } catch {}

    coin.classList.add("spin");
    resultBox.innerText = "Flipping...";

    const token = getToken();
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};

    try {
        const res = await fetch(API_BASE + "/toss/", { headers });

        if (!res.ok) throw new Error("Toss failed");

        const data = await res.json();

        setTimeout(() => {
            coin.classList.remove("spin");

            const heads = coin.querySelector(".heads");
            const tails = coin.querySelector(".tails");

            if (data.result === "HEADS") {
                heads.style.display = "flex";
                tails.style.display = "none";
            } else {
                heads.style.display = "none";
                tails.style.display = "flex";
            }

            resultBox.innerText = data.result;

            // refresh user history
            loadHistory();

        }, 1000);

    } catch (err) {
        coin.classList.remove("spin");
        resultBox.innerText = "Error";
        console.error(err);
    }
});

// Initialize page
updateAuthUI();
// loadHistory();
