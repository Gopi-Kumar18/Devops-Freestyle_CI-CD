@echo off
setlocal EnableDelayedExpansion

REM Variables
set COMPOSE_FILE=docker-compose.yml

REM Function to clean up existing services
echo Cleaning up existing services...

REM Bring down the existing services
echo Stopping and removing existing services...
docker-compose -f "%COMPOSE_FILE%" down

REM Main deployment process
echo Starting deployment process...

REM Bring up the services
echo Starting services...
docker-compose -f "%COMPOSE_FILE%" up -d

REM Wait for services to be created
timeout /t 5 >nul

REM Check service status
echo Checking service status...
docker-compose -f "%COMPOSE_FILE%" ps

echo Deployment completed successfully!
