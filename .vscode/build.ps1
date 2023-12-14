$arch = $args[0]

$package = Get-Content package.json | ConvertFrom-Json
$appName = $package.name
$electronVer = $package.devDependencies.electron
$buildDir = "_build/$arch/$appName"

# Remove old build
Remove-Item -r -ErrorAction Ignore ./$buildDir

# Copy Electron Binaries
mkdir $buildDir
Copy-Item -Recurse -Path "D:/Desarrollo/ElectronBinaries/$electronVer/$arch/*" -Destination "./$buildDir"

# Copy App from dist folder
mkdir $buildDir/resources/app
Copy-Item -Recurse dist/* $buildDir/resources/app

# Create package.json
$package.main = $package.main -replace "dist/"
$package | ConvertTo-Json -depth 100 | Out-File -Encoding "ascii" $buildDir/resources/app/package.json

# Create asar
Set-Location $buildDir/resources
asar p app/ app.asar
Remove-Item -r app/

# Rename electron.exe to name of app
Set-Location ..
Move-Item -ErrorAction SilentlyContinue electron.exe "$appName.exe"
Move-Item -ErrorAction SilentlyContinue electron "$appName"