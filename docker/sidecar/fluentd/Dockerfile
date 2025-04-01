# fluentd/Dockerfile
FROM fluent/fluentd:v1.16-1

# root로 전환하여 권한 획득
USER root

# 플러그인 설치 및 필요한 디렉토리 생성
RUN gem install fluent-plugin-s3 \
    && mkdir -p /fluentd/log/s3-buffer \
    && chown -R fluent:fluent /fluentd/log

# 다시 fluent 사용자로 전환 (기본 사용자 UID: 100)
USER fluent
