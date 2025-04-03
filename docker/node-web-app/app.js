const express = require("express");
const app = express();
const port = 4173;

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>카카오 클라우드 - 단일 VM Custom 웹 서비스</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          h1 {
            color: #FF7E00;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .info {
            text-align: left;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎉 로컬 수정사항이 성공적으로 배포되었습니다!</h1>
          <h2>카카오 클라우드 VM에서 실행 중인 Custom 웹 서비스</h2>

          <div class="info">
            <h3>서버 정보:</h3>
            <ul>
              <li>호스트명: ${require("os").hostname()}</li>
              <li>플랫폼: ${require("os").platform()} ${require("os").release()}</li>
              <li>메모리: ${Math.round(
                require("os").totalmem() / (1024 * 1024 * 1024)
              )} GB</li>
              <li>현재 시간: ${new Date().toLocaleString("ko-KR", {
                timeZone: "Asia/Seoul",
              })}</li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`웹 애플리케이션이 포트 ${port}에서 실행 중입니다...`);
});
