@echo off
title Shoopa's Discord Ghetto-AI Bot!
echo Welcome! Launching bot service.
echo.

cd built
if ERRORLEVEL 1 (
echo.
echo Please build the project first. Run 'build.bat'.
pause
exit
)

echo(
node igniter.js
)
echo ----- Bot terminated. -----
echo.

set /p runFallback=Run fallback build? [y/n]: 
echo %runFallback%
if /i "%runFallback%"=="y" (
echo(
echo Running fallback... 
cd ../
cd built_fallback
node igniter.js
echo ----- Fallback bot terminated. -----
)
echo.
)
echo Finished running.
pause
