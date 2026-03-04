#!/bin/bash

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() {
  echo -e "${2}${1}${NC}"
}

check_command() {
  command -v "$1" >/dev/null 2>&1
}

# 1. Fungsi Instalasi Dasar (Node & pnpm)
install_base() {
  log "\n🛠️ Checking Base Requirements (Node & pnpm)..." "$YELLOW"
  
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

  if check_command pnpm; then
    log "✅ pnpm is installed ($(pnpm -v))." "$GREEN"
  else
    log "⚠️ pnpm not found. Installing..." "$YELLOW"
    npm install -g pnpm
  fi
}

# 2. Fungsi Java (Hanya untuk Mobile)
install_java() {
  if check_command java; then
    log "✅ Java is already installed." "$GREEN"
  else
    log "⚠️ Java not found. Installing OpenJDK..." "$YELLOW"
    if [[ "$OSTYPE" == "darwin"* ]] && check_command brew; then
        brew install openjdk
        sudo ln -sfn /opt/homebrew/opt/openjdk/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk
    else
        log "❌ Please install Java JDK manually." "$RED"
    fi
  fi
}

# 3. Fungsi Go (Hanya untuk API)
install_go() {
  if check_command go; then
    log "✅ Go is already installed." "$GREEN"
  else
    log "⚠️ Go not found. Installing..." "$YELLOW"
    if [[ "$OSTYPE" == "darwin"* ]] && check_command brew; then
        brew install go
    else
        log "❌ Please install Go manually." "$RED"
    fi
  fi
}

# --- Menu Interaktif di Awal ---
log "🚀 Automation Environment Setup" "$GREEN"
echo -e "${YELLOW}Select the test environment you want to setup:${NC}"
echo "1) Mobile (Appium, Java, Android Driver)"
echo "2) Web (Node.js/WebdriverIO)"
echo "3) API/Load (Go, k6)"
echo "4) All (Default)"
read -p "Enter your choice [1-4]: " choice

# Jalankan instalasi dasar
install_base

case $choice in
  1)
    log "\n📱 Setting up Mobile Environment..." "$CYAN"
    install_java
    # Appium check
    if ! check_command appium; then
        npm install -g appium
        appium driver install uiautomator2
    fi
    ;;
  2)
    log "\n🌐 Setting up Web Environment..." "$CYAN"
    log "✅ Web environment relies on Node.js and project deps." "$GREEN"
    ;;
  3)
    log "\n🔌 Setting up API Environment..." "$CYAN"
    install_go
    if ! check_command k6; then
        if [[ "$OSTYPE" == "darwin"* ]] && check_command brew; then brew install k6; fi
    fi
    ;;
  4|"")
    log "\n📦 Setting up Everything..." "$CYAN"
    install_java
    install_go
    # Appium & k6
    if ! check_command appium; then npm install -g appium && appium driver install uiautomator2; fi
    if ! check_command k6 && [[ "$OSTYPE" == "darwin"* ]]; then brew install k6; fi
    ;;
  *)
    log "❌ Invalid choice." "$RED"
    exit 1
    ;;
esac

# Install dependencies project (selalu jalan)
log "\n📦 Installing Project Dependencies..." "$YELLOW"
pnpm install

log "\n✨ Setup Complete!" "$GREEN"

# Tips running
if [[ "$choice" == "1" || "$choice" == "4" || "$choice" == "" ]]; then log "👉 Run 'pnpm test:mobile'" "$NC"; fi
if [[ "$choice" == "2" || "$choice" == "4" || "$choice" == "" ]]; then log "👉 Run 'pnpm test:web'" "$NC"; fi
if [[ "$choice" == "3" || "$choice" == "4" || "$choice" == "" ]]; then log "👉 Run 'pnpm test:api:func'" "$NC"; fi