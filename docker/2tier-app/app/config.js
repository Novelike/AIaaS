// 환경에 따른 설정 관리
const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    db: {
      host: process.env.DB_HOST || "db", // docker-compose 서비스 이름
      user: process.env.DB_USER || "nodeuser",
      password: process.env.DB_PASSWORD || "password123",
      database: process.env.DB_NAME || "nodeapp",
    },
    port: process.env.PORT || 3000,
  },
  production: {
    db: {
      host: process.env.DB_HOST, // VM의 IP 주소
      user: process.env.DB_USER || "nodeuser",
      password: process.env.DB_PASSWORD || "password123",
      database: process.env.DB_NAME || "nodeapp",
    },
    port: process.env.PORT || 3000,
  },
};

module.exports = config[env];
