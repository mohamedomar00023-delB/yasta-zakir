@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.4.7-hotspot"
set "GRADLE_USER_HOME=D:\gradle-cache"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo JAVA_HOME=%JAVA_HOME%
java -version
echo.
echo Building APK...
call gradlew.bat assembleDebug
echo.
echo Done!
