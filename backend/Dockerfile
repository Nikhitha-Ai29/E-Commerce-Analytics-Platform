# Stage 1: Build the JAR
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
# Download dependencies first (cached layer)
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: Run the JAR
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/spanner-analytics-1.0.0.jar app.jar

# Cloud Run injects PORT env variable automatically
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
