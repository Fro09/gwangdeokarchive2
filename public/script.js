const API_URL = "https://gwangdeokarchive.onrender.com";

// 로그인 폼
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const classNo = document
            .getElementById("loginClassNo")
            .value
            .trim();
        const password = document
            .getElementById("loginPassword")
            .value
            .trim();

        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({classNo, password})
        });
        const data = await res.json();
        if (res.ok) {
            sessionStorage.setItem("user", JSON.stringify(data.user));
            location.href = "home.html";
        } else {
            alert(data.message || "로그인 실패");
        }
    });
}

// 회원가입 폼
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document
            .getElementById("signupName")
            .value
            .trim();
        const classNo = document
            .getElementById("signupClassNo")
            .value
            .trim();
        const password = document
            .getElementById("signupPassword")
            .value
            .trim();
        const confirm = document
            .getElementById("signupConfirm")
            .value
            .trim();

        if (password !== confirm) 
            return alert("비밀번호가 일치하지 않습니다.");
        
        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name, classNo, password})
        });
        const data = await res.json();
        if (res.ok) {
            alert("회원가입 완료");
            location.href = "index.html";
        } else {
            alert(data.message || "회원가입 실패");
        }
    });
}

// 홈 페이지
const welcomeMsg = document.getElementById("welcomeMsg");
if (welcomeMsg) {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) 
        location.href = "index.html";
    welcomeMsg.textContent = `${user.name} 님 환영합니다`;
}

// 로그아웃
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("user");
        location.href = "index.html";
    });
}

// 시간표 폼
const infoForm = document.getElementById("infoForm");
if (infoForm) {
    infoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const info = {
            grade: document
                .getElementById("grade")
                .value
                .trim(),
            class: document
                .getElementById("class")
                .value
                .trim(),
            number: document
                .getElementById("number")
                .value
                .trim(),
            name: document
                .getElementById("name")
                .value
                .trim()
        };
        sessionStorage.setItem("timetableUser", JSON.stringify(info));
        alert("정보가 저장되었습니다.");
    });
}
