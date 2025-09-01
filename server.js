const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 사용자 데이터를 저장할 파일 경로
const USERS_DB_PATH = path.join(__dirname, 'users.json');

// 미들웨어 설정
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS 설정 (프런트엔드와 백엔드가 다른 포트에서 실행될 때 필요)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

// 사용자 데이터 불러오기
const getUsers = () => {
    try {
        const data = fs.readFileSync(USERS_DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// 사용자 데이터 저장
const saveUsers = (users) => {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2), 'utf8');
};

// 회원가입 API
app.post('/api/signup', (req, res) => {
    const {name, classNo, password} = req.body;
    const users = getUsers();

    if (users.some(u => u.classNo === classNo)) {
        return res
            .status(409)
            .json({message: '이미 등록된 학년반번호입니다.'});
    }

    users.push({name, classNo, password});
    saveUsers(users);

    res
        .status(201)
        .json({message: '회원가입이 완료되었습니다.'});
});

// 로그인 API
app.post('/api/login', (req, res) => {
    const {classNo, password} = req.body;
    const users = getUsers();
    const user = users.find(u => u.classNo === classNo && u.password === password);

    if (user) {
        res.json({success: true, name: user.name, message: '로그인 성공'});
    } else {
        res
            .status(401)
            .json({success: false, message: '학년반번호 또는 비밀번호가 잘못되었습니다.'});
    }
});

// 루트 경로로 접속 시 index.html 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
