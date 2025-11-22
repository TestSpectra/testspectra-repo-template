Write-Host "🚀 Starting Automation Environment Setup..." -ForegroundColor Green

# Helper function to check command availability
function Test-CommandExists {
    param ($command)
    $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
}

function Check-Requirements {
    Write-Host "`n🛠️ Checking System Requirements..." -ForegroundColor Yellow

    # 1. Node.js
    if (Test-CommandExists node) {
        Write-Host "✅ Node.js is installed." -ForegroundColor Green
    } else {
        Write-Host "⚠️ Node.js not found. Installing..." -ForegroundColor Yellow
        if (Test-CommandExists winget) { winget install OpenJS.NodeJS }
        elseif (Test-CommandExists choco) { choco install nodejs }
        else { Write-Host "❌ Please install Node.js manually." -ForegroundColor Red; exit 1 }
    }

    # 2. pnpm
    if (Test-CommandExists pnpm) {
        Write-Host "✅ pnpm is installed." -ForegroundColor Green
    } else {
        Write-Host "⚠️ pnpm not found. Installing..." -ForegroundColor Yellow
        npm install -g pnpm
    }

    # 3. Java JDK
    if (Test-CommandExists java) {
        Write-Host "✅ Java is installed." -ForegroundColor Green
    } else {
        Write-Host "⚠️ Java not found. Installing OpenJDK..." -ForegroundColor Yellow
        if (Test-CommandExists winget) { winget install Microsoft.OpenJDK.17 }
        elseif (Test-CommandExists choco) { choco install openjdk }
        else { Write-Host "❌ Please install Java JDK manually." -ForegroundColor Red }
    }

    # 4. Go (Golang)
    if (Test-CommandExists go) {
        Write-Host "✅ Go is installed." -ForegroundColor Green
    } else {
        Write-Host "⚠️ Go not found. Installing..." -ForegroundColor Yellow
        if (Test-CommandExists winget) { winget install Go.Golang }
        elseif (Test-CommandExists choco) { choco install golang }
        else { Write-Host "❌ Please install Go manually." -ForegroundColor Red }
    }

    # 5. Android SDK (Check ADB)
    if (Test-CommandExists adb) {
        Write-Host "✅ Android SDK (adb) is installed." -ForegroundColor Green
    } else {
        Write-Host "⚠️ Android SDK/adb not found." -ForegroundColor Yellow
        Write-Host "📦 Installing Android Studio..." -ForegroundColor Yellow
        if (Test-CommandExists winget) { winget install Google.AndroidStudio }
        elseif (Test-CommandExists choco) { choco install android-studio }
        else { Write-Host "❌ Please install Android Studio/SDK manually." -ForegroundColor Red }
        Write-Host "👉 Please open Android Studio to complete SDK installation." -ForegroundColor Yellow
    }
}

Check-Requirements

function Setup-Mobile {
    Write-Host "`n📱 Setting up Mobile Environment..." -ForegroundColor Yellow
    
    # 1. Check/Install Global Appium
    Write-Host "`n📦 Checking Global Appium..." -ForegroundColor Yellow
    if (Test-CommandExists appium) {
        Write-Host "✅ Appium is already installed globally." -ForegroundColor Green
    } else {
        Write-Host "⚠️ Appium not found. Installing globally..." -ForegroundColor Yellow
        npm install -g appium
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Appium installed successfully." -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install Appium globally." -ForegroundColor Red
            exit 1
        }
    }

    # 2. Check/Install Android Driver (UiAutomator2)
    Write-Host "`n🤖 Checking Appium Android Driver (UiAutomator2)..." -ForegroundColor Yellow
    $drivers = appium driver list --installed --json | Out-String | ConvertFrom-Json
    if ($drivers.uiautomator2 -or ($drivers -is [array] -and ($drivers | Where-Object { $_.name -eq 'uiautomator2' }))) {
        Write-Host "✅ uiautomator2 driver is already installed." -ForegroundColor Green
    } else {
        Write-Host "⚠️ uiautomator2 driver not found. Installing..." -ForegroundColor Yellow
        appium driver install uiautomator2
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ uiautomator2 driver installed successfully." -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install uiautomator2 driver." -ForegroundColor Red
        }
    }

    # 3. Check/Install Appium Inspector
    Write-Host "`n🔍 Checking Appium Inspector..." -ForegroundColor Yellow
    Write-Host "⚠️ Automatic check for Appium Inspector on Windows is limited." -ForegroundColor Yellow
    Write-Host "👉 Please ensure Appium Inspector is installed: https://github.com/appium/appium-inspector/releases" -ForegroundColor Yellow
}

function Setup-Api {
    Write-Host "`n🔌 Setting up API/Load Testing Environment..." -ForegroundColor Yellow
    
    # Check/Install k6
    Write-Host "`n📉 Checking k6 (Load Testing Tool)..." -ForegroundColor Yellow
    if (Test-CommandExists k6) {
        Write-Host "✅ k6 is already installed." -ForegroundColor Green
    } else {
        Write-Host "⚠️ k6 not found." -ForegroundColor Yellow
        if (Test-CommandExists choco) {
            Write-Host "🍫 Installing k6 via Chocolatey..." -ForegroundColor Yellow
            choco install k6
        } elseif (Test-CommandExists winget) {
            Write-Host "📦 Installing k6 via Winget..." -ForegroundColor Yellow
            winget install k6
        } else {
            Write-Host "❌ Automatic installation for k6 not supported (Chocolatey/Winget missing)." -ForegroundColor Red
            Write-Host "👉 Please install k6 manually: https://k6.io/docs/get-started/installation/" -ForegroundColor Yellow
        }
    }
}

function Setup-Web {
    Write-Host "`n🌐 Setting up Web Environment..." -ForegroundColor Yellow
    Write-Host "✅ Web environment relies mainly on project dependencies." -ForegroundColor Green
}

function Install-Deps {
    Write-Host "`n📦 Installing Project Dependencies..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Project dependencies installed." -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install project dependencies." -ForegroundColor Red
        exit 1
    }
}

# Interactive Menu
Write-Host "`nSelect the test environment you want to setup:" -ForegroundColor Yellow
Write-Host "1) Mobile (Appium, Android Driver, Inspector)"
Write-Host "2) Web (WebdriverIO)"
Write-Host "3) API/Load (k6)"
Write-Host "4) All (Default)"
$choice = Read-Host "Enter your choice [1-4]"

switch ($choice) {
    "1" { Setup-Mobile; Install-Deps }
    "2" { Setup-Web; Install-Deps }
    "3" { Setup-Api; Install-Deps }
    "4" { Setup-Mobile; Setup-Web; Setup-Api; Install-Deps }
    ""  { Setup-Mobile; Setup-Web; Setup-Api; Install-Deps }
    Default { Write-Host "❌ Invalid choice. Exiting." -ForegroundColor Red; exit 1 }
}

Write-Host "`n✨ Setup Complete! You are ready to run tests." -ForegroundColor Green
if ($choice -in "1","4","") { Write-Host "👉 Run 'pnpm test:mobile' for mobile tests." }
if ($choice -in "2","4","") { Write-Host "👉 Run 'pnpm test:web' for web tests." }
if ($choice -in "3","4","") { Write-Host "👉 Run 'pnpm test:api:func' for API functional tests." }
