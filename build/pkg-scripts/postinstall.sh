#!/bin/bash
if ! [ -x "$(command -v git)" ]; then
  echo "Git not installed. Installing Git"
  /usr/bin/curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | /bin/bash
  /usr/local/bin/brew install git
else
  echo "Git already installed."
fi
