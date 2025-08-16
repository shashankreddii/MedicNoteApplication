@echo off
echo Starting MedicNote Backend...
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Java is not installed or not in PATH
    echo Please install Java 17 or higher
    pause
    exit /b 1
)

REM Check if Maven is installed
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Maven is not installed or not in PATH
    echo Please install Maven 3.6 or higher
    pause
    exit /b 1
)

echo Building and starting the application...
echo.
echo The backend will be available at: http://localhost:8080
echo H2 Database Console: http://localhost:8080/h2-console
echo.
echo Press Ctrl+C to stop the server
echo.

REM Build and run the application
mvn spring-boot:run

pause 