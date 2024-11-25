!macro customInstall
  ; Show a dialog to ask the user for permission to install Git
  MessageBox MB_YESNO|MB_ICONQUESTION "This application requires Git to work properly.\n\nDo you want to install Git now? This is necessary for optimal functionality." IDYES InstallGit IDNO SkipGit
  
  InstallGit:
    ; Install Git
    ExecWait '"$PLUGINSDIR\Git-Installer.exe" /VERYSILENT /NORESTART'
    Goto EndGitInstall
  
  SkipGit:
    ; Skip Git installation
    MessageBox MB_OK|MB_ICONWARNING "Git installation was skipped. Ensure Git is installed for the application to work properly."
  
  EndGitInstall:
!macroend

!macro customInit
  ; Copy the Git installer to the temporary installer directory
  File "/oname=$PLUGINSDIR\Git-Installer.exe" "${BUILD_RESOURCES_DIR}\Git-Installer.exe"
!macroend
