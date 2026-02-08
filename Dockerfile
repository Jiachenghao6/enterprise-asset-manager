# --- 构建阶段 (Build Stage) ---
FROM gradle:8-jdk21-alpine AS builder

WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src ./src

# 1. 执行构建
# 这里的 || return 0 是为了防止某些非致命错误中断构建，但标准做法是让它报错
RUN gradle clean bootJar -x test --no-daemon

# 2. 调试步骤：打印一下生成的文件，方便排查 (构建日志里能看到)
RUN ls -al build/libs/

# --- 运行阶段 (Run Stage) ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 3. 【核心修改】精准复制
# 使用 bootJar 任务通常只会生成一个可执行 jar，或者我们需要明确排除 plain jar
# 这里我们显式复制，并重命名
COPY --from=builder /app/build/libs/*.jar /app/

# 4. 自动脚本：找到那个不是 plain 的 jar 并重命名为 app.jar
# 这是一个 Shell 技巧，确保不管是哪个版本号，都能找到正确的 Fat Jar
RUN find /app -name "*.jar" ! -name "*-plain.jar" -exec mv {} /app/app.jar \;

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]