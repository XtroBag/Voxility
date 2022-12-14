@echo off

color 5
echo Adding new files if any...

git add *
git rm --cached .env

echo Finished adding new files!




echo Trying to commit...

git commit --all -m "Voxility Update"


if errorlevel 1 echo Failed to commit && pause
if errorlevel 0 echo Successfully commited!




echo Trying to push changes to origin...

git push origin

if errorlevel 1 echo Failed to push to origin && pause
if errorlevel 0 echo Successfully pushed changes to origin!


echo Finished updating Repository!


color

pause