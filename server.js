import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import pkg from "pg";

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL 연결 설정
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "mydb",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
});

app.use(cors());
app.use(bodyParser.json());

// DB 연결 테스트
pool.connect()
  .then(() => console.log("Connected to Postgres"))
  .catch((err) => console.error("Postgres connection error:", err));

// 기본 라우트
app.get("/", (req, res) => {
  res.send("Server is running");
});

// 회원가입 API
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword]
    );
    res.json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error or user already exists" });
  }
});

// 로그인 API
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: "User not found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
