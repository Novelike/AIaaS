// 캔버스 초기화
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// 로컬 플레이어 기본 정보 (이동 속도, 초기 위치)
let localPlayer = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    speed: 5,
    score: 0,
};

// 다른 플레이어 상태를 저장할 객체 (username 기준)
let otherPlayers = {};

// 총알 정보를 저장할 배열
let bullets = [];

// Socket.io 연결 (백엔드 서버 주소에 맞게 수정)
const socket = io("http://210.109.81.54:3000");

// 사용자명 입력 후 게임 참가 요청
const username = prompt("사용자명을 입력하세요:");
const sessionId = "defaultSessionId"; // 실제 환경에서는 API로 세션 관리
socket.emit("joinGame", { username, sessionId });

// 키 입력 상태 저장
let keys = {};
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    // 스페이스바로 총알 발사 (한 번만 발사하도록 추가 제어 가능)
    if (e.key === " ") {
        socket.emit("shoot", { x: localPlayer.x, y: localPlayer.y });
    }
});
document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// 매 프레임 업데이트: 플레이어 이동 후 서버에 전송
function update() {
    if (keys["ArrowLeft"] && localPlayer.x > 15) {
        localPlayer.x -= localPlayer.speed;
    }
    if (keys["ArrowRight"] && localPlayer.x < canvas.width - 15) {
        localPlayer.x += localPlayer.speed;
    }
    if (keys["ArrowUp"] && localPlayer.y > 30) {
        localPlayer.y -= localPlayer.speed;
    }
    if (keys["ArrowDown"] && localPlayer.y < canvas.height - 30) {
        localPlayer.y += localPlayer.speed;
    }
    socket.emit("playerAction", {
        username,
        x: localPlayer.x,
        y: localPlayer.y,
    });
}

// 우주선(삼각형) 그리기 함수
function drawSpaceship(x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x - 15, y + 20);
    ctx.lineTo(x + 15, y + 20);
    ctx.closePath();
    ctx.fill();
}

// 총알 그리기 함수
function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach((bullet) => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 점수 표시
function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText(`Score: ${localPlayer.score}`, 10, 25);
}

// 전체 그리기
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 로컬 플레이어 (흰색)
    drawSpaceship(localPlayer.x, localPlayer.y, "white");
    // 다른 플레이어 (빨간색)
    for (let uname in otherPlayers) {
        let p = otherPlayers[uname];
        drawSpaceship(p.x, p.y, "red");
    }
    // 총알 렌더링
    drawBullets();
    // 점수 표시
    drawScore();
}

// 게임 루프
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();

// 서버로부터 업데이트 이벤트 수신
socket.on("bulletUpdate", (data) => {
    bullets = data;
});

socket.on("playersUpdate", (playersData) => {
    playersData.forEach((player) => {
        if (player.username === username) {
            localPlayer.score = player.score;
            // 로컬 위치는 클라이언트에서 제어하므로 별도 업데이트하지 않음
        } else {
            otherPlayers[player.username] = player;
        }
    });
});

// 히트 이벤트: 피격 당했을 경우 알림
socket.on("playerHit", (data) => {
    alert(`당신이 ${data.shooter}에게 피격당했습니다!`);
});

// 점수 업데이트 (개별 알림 등 추가 가능)
socket.on("scoreUpdate", (data) => {
    localPlayer.score = data.score;
});
// 게임 종료 이벤트 (예: 세션 종료 등)
socket.on("gameOver", () => {
    alert("게임이 종료되었습니다.");
    window.location.reload(); // 페이지 새로고침
});
// 게임 종료 시 소켓 연결 종료
window.addEventListener("beforeunload", () => {
    socket.emit("disconnect");
});
// 소켓 연결 종료 시 로컬 플레이어 정보 삭제
socket.on("disconnect", () => {
    delete otherPlayers[username];
    console.log("서버와 연결이 종료되었습니다.");
});
// 소켓 연결 에러 처리
socket.on("connect_error", (error) => {
    console.error("소켓 연결 오류:", error);
    alert("서버와 연결할 수 없습니다. 나중에 다시 시도하세요.");
});
// 소켓 연결 재시도 처리
socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`서버와 재연결 시도 중... (${attemptNumber})`);
});
// 소켓 연결 재시도 실패 처리
socket.on("reconnect_failed", () => {
    console.error("서버와 재연결에 실패했습니다. 나중에 다시 시도하세요.");
    alert("서버와 재연결에 실패했습니다. 나중에 다시 시도하세요.");
});
// 소켓 연결 재시도 성공 처리
socket.on("reconnect", (attemptNumber) => {
    console.log(`서버와 재연결 성공! (${attemptNumber})`);
    alert("서버와 재연결되었습니다.");
});
// 소켓 연결 종료 처리
socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
        // 서버에서 연결을 종료한 경우
        alert("서버에서 연결을 종료했습니다.");
    } else {
        // 클라이언트에서 연결을 종료한 경우
        alert("연결이 종료되었습니다.");
    }
});
