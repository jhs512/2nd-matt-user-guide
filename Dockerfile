FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY backend/ .
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon
FROM eclipse-temurin:25-jre
WORKDIR /app
RUN useradd --system app
COPY --from=build /app/build/libs/*-SNAPSHOT.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
