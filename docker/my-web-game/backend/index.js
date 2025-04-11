const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./utils/db");
const { port } = require("./config");
const gameRoutes = require("./routes/gameRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // 모든 도메인 허용
    },
});

// 미들웨어
app.use(express.json());
app.use("/api/game", gameRoutes);
app.get("/", (req, res) => res.send("웹 게임 서버가 실행 중입니다."));

// 인메모리 게임 상태 (실제 운영 시에는 별도의 게임 엔진이나 DB를 사용할 수 있음)
const players = {}; // key: socket.id, value: { username, x, y, score }
const bullets = []; // 각 총알: { id, shooter, x, y, vx, vy }
const PLAYER_RADIUS = 20;
const BULLET_RADIUS = 5;

// 충돌 판정을 위한 간단한 거리 계산 함수
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

// 게임 루프: 총알 이동, 충돌 체크, 상태 브로드캐스트
setInterval(() => {
    // 총알 이동 및 충돌 체크
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // 화면 밖으로 벗어나면 제거
        if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
            bullets.splice(i, 1);
            continue;
        }

        // 각 플레이어와 충돌 체크 (발사자는 제외)
        for (let socketId in players) {
            const player = players[socketId];
            if (player.username === bullet.shooter) continue;
            if (
                distance(bullet.x, bullet.y, player.x, player.y) <
                PLAYER_RADIUS + BULLET_RADIUS
            ) {
                // 충돌 발생: 발사자에게 점수 추가
                for (let sId in players) {
                    if (players[sId].username === bullet.shooter) {
                        players[sId].score += 1;
                        io.to(sId).emit("scoreUpdate", {
                            score: players[sId].score,
                        });
                        break;
                    }
                }
                // 피격 당한 플레이어에게 알림
                io.to(socketId).emit("playerHit", { shooter: bullet.shooter });
                // 총알 제거 후 루프 탈출
                bullets.splice(i, 1);
                break;
            }
        }
    }

    // 모든 클라이언트에 최신 총알과 플레이어 상태 전송
    io.emit("bulletUpdate", bullets);
    io.emit("playersUpdate", Object.values(players));
}, 50); // 20 FPS 게임 루프

// Socket.io 이벤트 처리
io.on("connection", (socket) => {
    console.log("새로운 클라이언트 접속:", socket.id);

    // 클라이언트 연결 확인
    socket.emit("log", {
        event: "connection",
        message: `서버와 연결되었습니다. Socket ID: ${socket.id}`,
    });

    // 플레이어 참가 시 상태 초기화
    socket.on("joinGame", (data) => {
        console.log(`joinGame 이벤트 수신: ${JSON.stringify(data)}`);
        players[socket.id] = {
            username: data.username,
            x: 400, // 화면 중앙
            y: 550, // 하단 근처
            score: 0,
        };
        socket.join(data.sessionId);
        io.emit("playersUpdate", Object.values(players));
    });

    // 플레이어 이동 처리
    socket.on("playerAction", (data) => {
        console.log(`playerAction 이벤트 수신: ${JSON.stringify(data)}`);
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;

            // 모든 클라이언트에 플레이어 상태 업데이트
            io.emit("playersUpdate", Object.values(players));

            // 클라이언트로 이동 이벤트 로그 전송
            io.to(socket.id).emit("log", {
                event: "playerAction",
                message: `Player ${players[socket.id].username} moved to (${
                    data.x
                }, ${data.y})`,
            });
        }
    });

    // 총알 발사 처리
    socket.on("shoot", (data) => {
        if (!players[socket.id]) return;

        const isLocalPlayer = players[socket.id].username === data.username;

        const bullet = {
            id: Date.now() + Math.random(),
            shooter: players[socket.id].username,
            x: data.x,
            y: data.y,
            vx: 0,
            vy: isLocalPlayer ? -10 : 10, // 로컬 플레이어는 상단(-10), 다른 플레이어는 하단(10)
        };
        bullets.push(bullet);

        // 모든 클라이언트에 총알 상태 업데이트
        io.emit("bulletUpdate", bullets);

        // 클라이언트로 총알 발사 이벤트 로그 전송
        io.to(socket.id).emit("log", {
            event: "shoot",
            message: `Player ${
                players[socket.id].username
            } fired a bullet from (${data.x}, ${data.y})`,
        });
    });

    // 연결 해제 시 플레이어 제거
    socket.on("disconnect", () => {
        console.log("클라이언트 연결 해제:", socket.id);
        delete players[socket.id];
        io.emit("playersUpdate", Object.values(players));
    });
});

// DB 연결 후 서버 실행
connectDB().then(() => {
    server.listen(port, () =>
        console.log(`서버가 ${port} 포트에서 실행 중입니다.`)
    );
});
// DB 연결 실패 시 서버 종료
process.on("unhandledRejection", (err) => {
    console.error("DB 연결 실패:", err);
    process.exit(1); // 프로세스 종료
});
// 서버 종료 시 DB 연결 종료
process.on("SIGINT", () => {
    console.log("서버 종료 중...");
    server.close(() => {
        console.log("서버가 종료되었습니다.");
        process.exit(0);
    });
});
