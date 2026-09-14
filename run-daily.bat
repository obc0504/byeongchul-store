@echo off
cd /d "%~dp0"
if not exist logs mkdir logs

echo ==== %date% %time% ==== >> logs\daily-run.log
call npm run fetch:naver-orders >> logs\daily-run.log 2>&1
call npm run summarize:naver-orders >> logs\daily-run.log 2>&1
echo ==== 완료 ==== >> logs\daily-run.log
