#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
  echo -e "${2}${1}${NC}"
}

check_command() {
  command -v "$1" >/dev/null 2>&1
}

echo -e "${GREEN}🚀 Starting Automation Environment Setup...${NC}"

check_requirements() {
  log "\n🛠️ Checking System Requirements..." "$YELLOW"

  # 1. Node.js
  if check_command node; then
    log "✅ Node.js is installed ($(node -v))." "$GREEN"
  else
    log "⚠️ Node.js not found. Installing..." "$YELLOW"
    if [[ "$OSTYPE" == "darwin"* ]] && check_command brew; then
        brew install node
    else
        log "❌ Please install Node.js manually." "$RED"
        exit 1
    fi
  fi

  # 2. pnpm
  if check_command pnpm; then
    log "✅ pnpm is installed ($(pnpm -v))." "$GREEN"
  else
    log "⚠️ pnpm not found. Installing..." "$YELLOW"
    npm install -g pnpm
  fi

  # 3. Java JDK
  if check_command java; then
    log "✅ Java is installed ($(java -version 2>&1 | head -n 1))." "$GREEN"
  else
    log "⚠️ Java not found. Installing OpenJDK..." "$YELLOW"
    if [[ "$OSTYPE" == "darwin"* ]] && check_command brew; then
        brew install openjdk
        # Symlink for system Java wrappers
        sudo ln -sfn /opt/homebrew/opt/openjdk/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk
    else
        log "❌ Please install Java JDK manually." "$RED"
    fi
  fi

  # 4. Go (Golang)
  if check_command go; then
    log "✅ Go is installed ($(go version | awk '{print $3}'))." "$GREEN"
  else
    log "⚠️ Go not found. Installing..." "$YELLOW"
    if [[ "$OSTYPE" == "darwin"* ]] && check_command brew; then
        brew install go
    else
        log "❌ Please install Go manually." "$RED"
    fi
  fi

  # 5. Android SDK (Check ADB)
  if check_command adb; then
    log "✅ Android SDK (adb) is installed." "$GREEN"
  else
    log "⚠️ Android SDK/adb not found." "$YELLOW"
    if [[ "$OSTYPE" == "darwin"* ]] && check_command brew; then
        log "🍺 Installing Android Studio via Homebrew..." "$YELLOW"
        brew install --cask android-studio
        log "👉 Please open Android Studio to complete SDK installation." "$YELLOW"
        log "👉 Then add platform-tools to your PATH." "$YELLOW"
    else
        log "❌ Please install Android Studio/SDK manually." "$RED"
    fi
  fi
}

check_requirements

setup_mobile() {
  log "\n📱 Setting up Mobile Environment..." "$YELLOW"
  
  # 1. Check/Install Global Appium
  log "\n📦 Checking Global Appium..." "$YELLOW"
  if check_command appium; then
    log "✅ Appium is already installed globally." "$GREEN"
  else
    log "⚠️ Appium not found. Installing globally..." "$YELLOW"
    if npm install -g appium; then
      log "✅ Appium installed successfully." "$GREEN"
    else
      log "❌ Failed to install Appium globally." "$RED"
      exit 1
    fi
  fi

  # 2. Check/Install Android Driver (UiAutomator2)
  log "\n🤖 Checking Appium Android Driver (UiAutomator2)..." "$YELLOW"
  if appium driver list --installed --json | grep -q "uiautomator2"; then
    log "✅ uiautomator2 driver is already installed." "$GREEN"
  else
    log "⚠️ uiautomator2 driver not found. Installing..." "$YELLOW"
    if appium driver install uiautomator2; then
      log "✅ uiautomator2 driver installed successfully." "$GREEN"
    else
      log "❌ Failed to install uiautomator2 driver." "$RED"
    fi
  fi

  # 3. Check/Install Appium Inspector
  log "\n🔍 Checking Appium Inspector..." "$YELLOW"
  if [ -d "/Applications/Appium Inspector.app" ]; then
    log "✅ Appium Inspector is installed." "$GREEN"
  else
    log "⚠️ Appium Inspector not found." "$YELLOW"
    if [[ "$OSTYPE" == "darwin"* ]] && check_command brew; then
      log "🍺 Installing Appium Inspector via Homebrew Cask..." "$YELLOW"
      if brew install --cask appium-inspector; then
          log "✅ Appium Inspector installed successfully." "$GREEN"
      else
          log "❌ Failed to install Appium Inspector." "$RED"
      fi
    else
      log "❌ Automatic installation for Appium Inspector not supported." "$RED"
      log "👉 Please download manually: https://github.com/appium/appium-inspector/releases" "$YELLOW"
    fi
  fi
}

setup_api() {
  log "\n🔌 Setting up API/Load Testing Environment..." "$YELLOW"
  
  # Check/Install k6
  log "\n📉 Checking k6 (Load Testing Tool)..." "$YELLOW"
  if check_command k6; then
    log "✅ k6 is already installed." "$GREEN"
  else
    log "⚠️ k6 not found." "$YELLOW"
    if [[ "$OSTYPE" == "darwin"* ]] && check_command brew; then
      log "🍺 Installing k6 via Homebrew..." "$YELLOW"
      if brew install k6; then
          log "✅ k6 installed successfully." "$GREEN"
      else
          log "❌ Failed to install k6." "$RED"
      fi
    else
      log "❌ Automatic installation for k6 not supported on this OS or Homebrew missing." "$RED"
      log "👉 Please install k6 manually: https://k6.io/docs/get-started/installation/" "$YELLOW"
    fi
  fi
}

setup_web() {
  log "\n🌐 Setting up Web Environment..." "$YELLOW"
  log "✅ Web environment relies mainly on project dependencies." "$GREEN"
}

install_deps() {
  log "\n📦 Installing Project Dependencies..." "$YELLOW"
  if pnpm install; then
    log "✅ Project dependencies installed." "$GREEN"
  else
    log "❌ Failed to install project dependencies." "$RED"
    exit 1
  fi
}

# Interactive Menu
echo -e "\n${YELLOW}Select the test environment you want to setup:${NC}"
echo "1) Mobile (Appium, Android Driver, Inspector)"
echo "2) Web (WebdriverIO)"
echo "3) API/Load (k6)"
echo "4) All (Default)"
read -p "Enter your choice [1-4]: " choice

case $choice in
  1)
    setup_mobile
    install_deps
    ;;
  2)
    setup_web
    install_deps
    ;;
  3)
    setup_api
    install_deps
    ;;
  4|"")
    setup_mobile
    setup_web
    setup_api
    install_deps
    ;;
  *)
    log "❌ Invalid choice. Exiting." "$RED"
    exit 1
    ;;
esac

log "\n✨ Setup Complete! You are ready to run tests." "$GREEN"
if [[ "$choice" == "1" || "$choice" == "4" || "$choice" == "" ]]; then
    log "👉 Run 'pnpm test:mobile' for mobile tests." "$NC"
fi
if [[ "$choice" == "2" || "$choice" == "4" || "$choice" == "" ]]; then
    log "👉 Run 'pnpm test:web' for web tests." "$NC"
fi
if [[ "$choice" == "3" || "$choice" == "4" || "$choice" == "" ]]; then
    log "👉 Run 'pnpm test:api:func' for API functional tests." "$NC"
fi
