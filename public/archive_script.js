document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = 'http://localhost:3000';
  const archiveList = document.getElementById('archive-list');
  const adminTools = document.getElementById('admin-tools');
  const addFolderBtn = document.getElementById('add-folder-btn');
  const addFileBtn = document.getElementById('add-file-btn');
  const overlay = document.getElementById('overlay');
  const closeModalBtn = document.getElementById('close-modal');
  const modalTitle = document.getElementById('modal-title');
  const adminForm = document.getElementById('admin-form');
  const input1 = document.getElementById('input1');
  const input2 = document.getElementById('input2');
  const submitBtn = document.getElementById('submit-btn');

  // 사용자 권한 확인
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  if (isAdmin) {
    adminTools.style.display = 'flex';
  }

  // 데이터베이스에서 아카이브 목록 불러오기
  const fetchArchiveData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/archive`);
      const data = await response.json();
      renderArchive(data.folders);
    } catch (error) {
      console.error('Failed to fetch archive data:', error);
      alert('아카이브 데이터를 불러오는 데 실패했습니다.');
    }
  };

  // 아카이브 목록 화면에 렌더링
  const renderArchive = (folders) => {
    archiveList.innerHTML = '';
    folders.forEach(folder => {
      const folderBlock = document.createElement('div');
      folderBlock.className = 'folder-block';
      folderBlock.innerHTML = `
        <h2 class="folder-title">${folder.name}</h2>
        <div class="file-list"></div>
      `;
      const fileList = folderBlock.querySelector('.file-list');
      folder.files.forEach(file => {
        const fileBlock = document.createElement('div');
        fileBlock.className = 'file-block';
        fileBlock.innerHTML = `
          <div class="file-name">${file.name}</div>
          <div class="file-meta">
            <span class="provided-by">제공: ${file.providedBy}</span>
            <a href="${file.downloadUrl}" class="download-btn" download="${file.name}">다운로드</a>
          </div>
        `;
        fileList.appendChild(fileBlock);
      });
      archiveList.appendChild(folderBlock);
    });
  };

  // 모달 닫기
  closeModalBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
  window.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.display = 'none';
    }
  });

  // 관리자: 폴더 추가 모달
  addFolderBtn.addEventListener('click', () => {
    modalTitle.textContent = '새 폴더 추가';
    input1.placeholder = '폴더 이름';
    input2.style.display = 'none';
    adminForm.dataset.mode = 'add-folder';
    submitBtn.textContent = '추가';
    overlay.style.display = 'flex';
    input1.value = '';
    input2.value = '';
  });

  // 관리자: 파일 추가 모달
  addFileBtn.addEventListener('click', () => {
    modalTitle.textContent = '새 파일 추가';
    input1.placeholder = '폴더 이름';
    input2.placeholder = '파일 제공자 이름';
    input2.style.display = 'block';
    adminForm.dataset.mode = 'add-file';
    submitBtn.textContent = '추가';
    overlay.style.display = 'flex';
    input1.value = '';
    input2.value = '';
  });

  // 관리자 폼 제출
  adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = adminForm.dataset.mode;
    const folderName = input1.value;
    const providedBy = input2.value;

    if (mode === 'add-folder') {
      try {
        const response = await fetch(`${API_URL}/api/admin/folder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderName }),
        });
        const result = await response.json();
        alert(result.message);
        if (response.ok) {
          fetchArchiveData();
          overlay.style.display = 'none';
        }
      } catch (error) {
        alert('폴더 추가 중 오류가 발생했습니다.');
        console.error(error);
      }
    } else if (mode === 'add-file') {
      const fileName = prompt('파일 이름을 입력하세요 (예: 2학기 수학 시험지.pdf)');
      if (!fileName) return;

      try {
        const response = await fetch(`${API_URL}/api/admin/file`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderName, fileName, providedBy }),
        });
        const result = await response.json();
        alert(result.message);
        if (response.ok) {
          fetchArchiveData();
          overlay.style.display = 'none';
        }
      } catch (error) {
        alert('파일 추가 중 오류가 발생했습니다.');
        console.error(error);
      }
    }
  });

  // 초기 아카이브 데이터 불러오기
  fetchArchiveData();
});
