!macro customInstall
  ExecWait '"$PLUGINSDIR\Git-Installer.exe" /VERYSILENT /NORESTART'
!macroend

!macro customInit
  File "/oname=$PLUGINSDIR\Git-Installer.exe" "${BUILD_RESOURCES_DIR}\Git-Installer.exe"
!macroend