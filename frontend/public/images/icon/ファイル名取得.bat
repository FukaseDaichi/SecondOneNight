@echo off
setlocal enabledelayedexpansion

set STR=
for /F %%A in ('dir /B') do (
  set STR=!STR!"%%A",
)
echo [%STR%]
endlocal
pause