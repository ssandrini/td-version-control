!macro customInstall
  ; Check if Git is already installed
  ClearErrors
  nsExec::ExecToStack 'where git'
  Pop $0 ; Exit code
  ${If} $0 != 0
    ; Git is not installed, ask the user if they want to install it
    MessageBox MB_YESNO "This application requires Git to work properly. Do you want to install Git now? This is necessary for optimal functionality." IDYES InstallGit IDNO SkipGit

    InstallGit:
      ; Execute the Git installer if the user clicked YES
      ExecWait '"$PLUGINSDIR\Git-Installer.exe" /VERYSILENT /NORESTART'
      Goto Done

    SkipGit:
      ; If the user skips, just go to Done
      DetailPrint "Git installation skipped."
      Goto Done
  ${Else}
    ; Git is already installed
    DetailPrint "Git is already installed."
  ${EndIf}

  Done:
!macroend

!macro customInit
  ; Copy the Git installer to the temporary directory if not already present
  File "/oname=$PLUGINSDIR\Git-Installer.exe" "${BUILD_RESOURCES_DIR}\Git-Installer.exe"
!macroend
