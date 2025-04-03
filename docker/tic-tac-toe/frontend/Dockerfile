FROM node:22 as build
WORKDIR /app

# npm 최신 버전 설치
RUN npm install -g npm@11.2.0

# package.json과 package-lock.json 복사
COPY package*.json ./

# public 폴더 복사 추가
COPY public/ ./public/

# src 폴더 복사 추가
COPY src/ ./src/

# 의존성 설치
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . . 
RUN npm run build

ENV REACT_APP_BACKEND_URL=http://backend:5000

FROM nginx:1.25.3-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]