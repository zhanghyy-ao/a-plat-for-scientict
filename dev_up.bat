@echo off
REM One-command dev: install, migrate, run server
setlocal
pushd %~dp0

cd server
IF NOT EXIST node_modules (
  call npm i
)
call npx prisma generate
call npx prisma migrate dev --name init
call npx ts-node src/index.ts

popd
endlocal
