const ARCHIVE_API = "https://gwangdeok.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) 
        location.href = "index.html";
    
    // 관리자 기능 표시
    if (user.classNo === "admin") {
        document
            .getElementById("admin-tools")
            .style
            .display = "block";
    }

    const archiveList = document.getElementById("archive-list");
    const overlay = document.getElementById("overlay");
    const closeModal = document.getElementById("close-modal");
    const modalTitle = document.getElementById("modal-title");
    const adminForm = document.getElementById("admin-form");
    const input1 = document.getElementById("input1");
    const input2 = document.getElementById("input2");
    const submitBtn = document.getElementById("submit-btn");

    // 아카이브 불러오기
    async function loadArchive() {
        const res = await fetch(`${ARCHIVE_API}/archive`);
        const data = await res.json();
        archiveList.innerHTML = "";
        data.forEach(folder => {
            const folderDiv = document.createElement("div");
            folderDiv.className = "folder-block";
            folderDiv.innerHTML = `
                <h2 class="folder-title">${folder
                .name}</h2>
                <div class="file-list">
                    ${folder
                .files
                .map(
                    file => `
                        <div class="file-block">
                            <div class="file-name">${file.name}</div>
                            <div class="file-meta">
                                <span class="provided-by">제공: ${file.providedBy}</span>
                                <a href="${file.url}" class="download-btn" target="_blank">다운로드</a>
                            </div>
                        </div>
                    `
                )
                .join("")}
                </div>
            `;
            archiveList.appendChild(folderDiv);
        });
    }
    loadArchive();

    // 모달 열기
    function openModal(title, placeholder1, placeholder2 = "", btnText) {
        modalTitle.textContent = title;
        input1.placeholder = placeholder1;
        input2.placeholder = placeholder2;
        input2.style.display = placeholder2
            ? "block"
            : "none";
        submitBtn.textContent = btnText;
        overlay.style.display = "block";
    }

    // 모달 닫기
    closeModal.addEventListener("click", () => overlay.style.display = "none");

    // 폴더 추가
    const addFolderBtn = document.getElementById("add-folder-btn");
    addFolderBtn.addEventListener(
        "click",
        () => openModal("폴더 추가", "폴더 이름", "", "추가")
    );

    // 파일 추가
    const addFileBtn = document.getElementById("add-file-btn");
    addFileBtn.addEventListener(
        "click",
        () => openModal("파일 추가", "파일 이름", "제공자 이름", "추가")
    );

    // 폴더/파일 제출
    adminForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name1 = input1
            .value
            .trim();
        const name2 = input2
            .value
            .trim();

        if (modalTitle.textContent === "폴더 추가") {
            await fetch(`${ARCHIVE_API}/archive/folder`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({name: name1})
            });
        } else if (modalTitle.textContent === "파일 추가") {
            await fetch(`${ARCHIVE_API}/archive/file`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({name: name1, providedBy: name2})
            });
        }
        overlay.style.display = "none";
        loadArchive();
    });
});
