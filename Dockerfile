# --- 构建阶段 (Build Stage) ---
# 使用官方 Gradle 镜像，基于 JDK 21
FROM gradle:8.5-jdk21 AS builder

# 设置工作目录
WORKDIR /app

# 复制 Gradle 配置文件（利用 Docker 缓存机制，加快构建速度）
COPY build.gradle settings.gradle ./
# 如果你有 gradle 文件夹（wrapper），也复制进去
COPY gradle ./gradle

# 复制源代码
COPY src ./src

# 执行构建，跳过测试以节省时间（测试应在 CI/CD 环节跑）
# 注意：这里直接使用 gradle 镜像提供的 gradle 命令
RUN gradle clean build -x test --no-daemon

# --- 运行阶段 (Run Stage) ---
# 使用精简版的 Java 21 运行时镜像
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 从构建阶段复制生成的 jar 包
# 注意：这里假设 build/libs 下只有一个 jar 包，或者你可以指定具体名字
COPY --from=builder /app/build/libs/*.jar app.jar

# 暴露端口 (与 application.properties 默认端口一致)
EXPOSE 8080

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]