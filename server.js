const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const {Pool} = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

// DB 설정
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Render PostgreSQL URL
    ssl: {
        rejectUnauthorized: false
    }
});

// 미들웨어
app.use(cors());
app.use(bodyParser.json());

// ======= 회원가입 =======
app.post("/signup", async (req, res) => {
    const {name, classNo, password} = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        const exists = await pool.query(
            "SELECT * FROM users WHERE classno=$1",
            [classNo]
        );
        if (exists.rows.length) 
            return res
                .status(400)
                .json({message: "이미 가입된 학번입니다."});
        await pool.query(
            "INSERT INTO users(name, classno, password) VALUES($1, $2, $3)",
            [name, classNo, hashed]
        );
        res.json({message: "회원가입 완료"});
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({message: "서버 오류"});
    }
});

// ======= 로그인 =======
app.post("/login", async (req, res) => {
    const {classNo, password} = req.body;
    try {
        const userRes = await pool.query(
            "SELECT * FROM users WHERE classno=$1",
            [classNo]
        );
        if (!userRes.rows.length) 
            return res
                .status(400)
                .json({message: "회원이 없습니다."});
        
        const user = userRes.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) 
            return res
                .status(400)
                .json({message: "비밀번호가 틀립니다."});
        
        res.json({
            user: {
                id: user.id,
                name: user.name,
                classNo: user.classno
            }
        });
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({message: "서버 오류"});
    }
});

// ======= 아카이브 불러오기 =======
app.get("/archive", async (req, res) => {
    try {
        const foldersRes = await pool.query("SELECT * FROM folders ORDER BY id ASC");
        const folders = await Promise.all(foldersRes.rows.map(async folder => {
            const filesRes = await pool.query(
                "SELECT * FROM files WHERE folder_id=$1 ORDER BY id ASC",
                [folder.id]
            );
            return {
                ...folder,
                files: filesRes.rows
            };
        }));
        res.json(folders);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({message: "서버 오류"});
    }
});

// ======= 폴더 추가 =======
app.post("/archive/folder", async (req, res) => {
    const {name} = req.body;
    try {
        await pool.query("INSERT INTO folders(name) VALUES($1)", [name]);
        res.json({message: "폴더 추가 완료"});
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({message: "서버 오류"});
    }
});

// ======= 파일 추가 =======
app.post("/archive/file", async (req, res) => {
    const {name, providedBy, folderId} = req.body;
    try {
        await pool.query(
            "INSERT INTO files(name, providedby, folder_id) VALUES($1, $2, $3)",
            [
                name, providedBy, folderId || 1
            ] // folderId 미입력 시 기본 폴더 1번
        );
        res.json({message: "파일 추가 완료"});
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({message: "서버 오류"});
    }
});

// ======= 서버 시작 =======
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
