@echo off
REM Docker 로그인
docker login kc-sfacspace.kr-central-2.kcr.dev --username 3c41de12a5914a34b737808a59a4925f --password 165638666ebad648e994dbd0417dd5582c4855b59f79e0499fbb9096fcb237b74646a8

REM Docker 이미지 빌드 및 태그
echo Building Docker images...
docker build -t kc-sfacspace.kr-central-2.kcr.dev/kjh-repo/frontend:latest -f docker/Dockerfile.frontend .
docker build -t kc-sfacspace.kr-central-2.kcr.dev/kjh-repo/backend:latest -f docker/Dockerfile.backend .

REM Docker 이미지 푸시
echo Pushing Docker images to registry...
docker push kc-sfacspace.kr-central-2.kcr.dev/kjh-repo/frontend:latest
docker push kc-sfacspace.kr-central-2.kcr.dev/kjh-repo/backend:latest

REM Kubernetes 리소스 적용
echo Applying Kubernetes resources...
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml

echo Deployment completed!
pause