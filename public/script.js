document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const welcomeMsg = document.getElementById("welcomeMsg");

    // API 호출을 위한 기본 URL (배포 환경에서는 Render URL로 변경)
    const API_URL = 'http://localhost:3000';

    // 회원가입
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document
                .getElementById("signupName")
                .value;
            const classNo = document
                .getElementById("signupClassNo")
                .value;
            const password = document
                .getElementById("signupPassword")
                .value;
            const confirm = document
                .getElementById("signupConfirm")
                .value;

            if (password !== confirm) {
                alert("비밀번호가 일치하지 않습니다 ❌");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({name, classNo, password})
                });

                const result = await response.json();

                if (response.status === 201) {
                    alert("회원가입이 완료되었습니다 ✅");
                    window.location.href = "index.html";
                } else {
                    alert(`오류: ${result.message}`);
                }
            } catch (error) {
                alert("회원가입 중 오류가 발생했습니다 ❌");
                console.error('Error:', error);
            }
        });
    }

    // 로그인
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const classNo = document
                .getElementById("loginClassNo")
                .value;
            const password = document
                .getElementById("loginPassword")
                .value;

            try {
                const response = await fetch(`${API_URL}/api/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({classNo, password})
                });

                const result = await response.json();

                if (result.success) {
                    sessionStorage.setItem("isLoggedIn", "true");
                    sessionStorage.setItem("currentUser", result.name);
                    window.location.href = "home.html";
                } else {
                    alert(`로그인 실패: ${result.message}`);
                }
            } catch (error) {
                alert("로그인 중 오류가 발생했습니다 ❌");
                console.error('Error:', error);
            }
        });
    }

    // 홈 화면
    if (welcomeMsg) {
        const isLoggedIn = sessionStorage.getItem("isLoggedIn");
        const currentUser = sessionStorage.getItem("currentUser");

        if (!isLoggedIn) {
            window.location.href = "index.html";
            return;
        }
        welcomeMsg.textContent = `${currentUser}님 반갑습니다`;

        // 로그아웃 버튼
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem("isLoggedIn");
                sessionStorage.removeItem("currentUser");
                window.location.href = "index.html";
            });
        }
    }
});
