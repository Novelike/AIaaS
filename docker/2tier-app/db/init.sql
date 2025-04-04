CREATE DATABASE IF NOT EXISTS nodeapp;
USE nodeapp;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 감사 로그를 저장할 테이블 생성
CREATE TABLE IF NOT EXISTS user_audit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,               -- 변경된 사용자의 ID
    action VARCHAR(10) NOT NULL,  -- 'INSERT' 또는 'DELETE'
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 이벤트 발생 시간
    username VARCHAR(50),
    email VARCHAR(100)
);

-- 감사 로그 트리거 생성
DELIMITER $$
CREATE TRIGGER trg_users_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO user_audit (user_id, action, username, email)
    VALUES (NEW.id, 'INSERT', NEW.username, NEW.email);
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_users_after_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO user_audit (user_id, action, username, email)
    VALUES (OLD.id, 'DELETE', OLD.username, OLD.email);
END$$
DELIMITER ;


-- 기본 사용자 데이터 추가
INSERT INTO users (username, email) VALUES
('user1', 'user1@example.com'),
('user2', 'user2@example.com'),
('user3', 'user3@example.com'),
('user4', 'user4@example.com'),
('kjh', 'kjh@example.com');

-- Grafana 모니터링을 위한 권한 설정
CREATE USER IF NOT EXISTS 'grafana'@'%' IDENTIFIED BY 'grafana';
GRANT SELECT ON nodeapp.* TO 'grafana'@'%';
FLUSH PRIVILEGES;
