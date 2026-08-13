@echo off
cd /d "d:\moohamed imail\yasta-zakir"
echo ==============================================
echo [1/2] Trying with mohamedomar00023-delB ...
echo ==============================================
git remote set-url origin https://github.com/mohamedomar00023-delB/yasta-zakir.git
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ==============================================
    echo [2/2] Trying with mohamedomar00023-del8 ...
    echo ==============================================
    git remote set-url origin https://github.com/mohamedomar00023-del8/yasta-zakir.git
    git push -u origin main
)
echo.
echo ==============================================
echo Finished! Check above for the success message.
echo ==============================================
pause
