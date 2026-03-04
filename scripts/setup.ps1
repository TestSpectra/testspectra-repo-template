Write-Host "--- Automation Environment Setup ---" -ForegroundColor Green

# 1. Fungsi pembantu untuk cek command
function Test-CommandExists {
    param ($command)
    $cmd = Get-Command $command -ErrorAction SilentlyContinue
    return ($null -ne $cmd)
}

# 2. Fungsi instalasi per komponen
function Install-NodePnpm {
    Write-Host "`n[Checking Node & PNPM]" -ForegroundColor Yellow
    if (-not (Test-CommandExists "node")) {
        Write-Host "Installing Node.js..."
        if (Test-CommandExists "winget") { winget install OpenJS.NodeJS }
        elseif (Test-CommandExists "choco") { choco install nodejs }
    }
    if (-not (Test-CommandExists "pnpm")) {
        Write-Host "Installing pnpm..."
        npm install -g pnpm
    }
}

function Install-Java {
    if (-not (Test-CommandExists "java")) {
        Write-Host "`n[Installing Java for Mobile/Android]" -ForegroundColor Yellow
        if (Test-CommandExists "winget") { winget install Microsoft.OpenJDK.17 }
        elseif (Test-CommandExists "choco") { choco install openjdk }
    } else {
        Write-Host "OK: Java already installed." -ForegroundColor Green
    }
}

function Install-Go {
    if (-not (Test-CommandExists "go")) {
        Write-Host "`n[Installing Go for API/k6]" -ForegroundColor Yellow
        if (Test-CommandExists "winget") { winget install Go.Golang }
    } else {
        Write-Host "OK: Go already installed." -ForegroundColor Green
    }
}

# --- ALUR UTAMA ---

# A. Pilih Menu Dulu
Write-Host "`nSelect the environment you want to setup:" -ForegroundColor Cyan
Write-Host "1. Mobile (Needs Node, Java, Appium)"
Write-Host "2. Web (Needs Node)"
Write-Host "3. API/Load (Needs Node, Go, k6)"
Write-Host "4. All (Default)"
$choice = Read-Host "Choice [1-4]"

# B. Jalankan Instalasi Berdasarkan Pilihan
Install-NodePnpm

if ($choice -eq "1" -or $choice -eq "4" -or $choice -eq "") {
    Write-Host "`n--- Setting up Mobile ---" -ForegroundColor Magenta
    Install-Java
    if (-not (Test-CommandExists "appium")) {
        Write-Host "Installing Appium..."
        npm install -g appium
        appium driver install uiautomator2
    }
}

if ($choice -eq "3" -or $choice -eq "4" -or $choice -eq "") {
    Write-Host "`n--- Setting up API ---" -ForegroundColor Magenta
    Install-Go
    if (-not (Test-CommandExists "k6")) {
        Write-Host "Installing k6..."
        if (Test-CommandExists "winget") { winget install k6 }
        elseif (Test-CommandExists "choco") { choco install k6 }
    }
}

# C. Install Project Dependencies (Selalu dijalankan)
Write-Host "`n--- Finishing: Installing Project Dependencies ---" -ForegroundColor Yellow
pnpm install

Write-Host "`n--- Setup Complete! ---" -ForegroundColor Green

# D. Petunjuk Running
Write-Host "`nNext Steps:" -ForegroundColor Cyan
if ($choice -eq "1" -or $choice -eq "4" -or $choice -eq "") { Write-Host "- Run Mobile: pnpm test:mobile" }
if ($choice -eq "2" -or $choice -eq "4" -or $choice -eq "") { Write-Host "- Run Web: pnpm test:web" }
if ($choice -eq "3" -or $choice -eq "4" -or $choice -eq "") { Write-Host "- Run API: pnpm test:api:func" }