# Definieer de basisdirectory
$baseDir = "F:\Departments"

# Lijst met afdelingen
$afdelingen = @(
    "HR",
    "IT",
    "Management",
    "Marketing",
    "Finance",
    "Operations",
    "Sales",
    "Legal",
    "Research",
    "Support"
)

# Controleer of de basisdirectory bestaat, zo niet, maak het aan
if (-not (Test-Path -Path $baseDir)) {
    New-Item -ItemType Directory -Path $baseDir
}

# Maak de mappen aan
foreach ($afdeling in $afdelingen) {
    $folderPath = Join-Path -Path $baseDir -ChildPath $afdeling
    if (-not (Test-Path -Path $folderPath)) {
        New-Item -ItemType Directory -Path $folderPath
        Write-Host "Map aangemaakt: $folderPath"
    } else {
        Write-Host "Map bestaat al: $folderPath"
    }
}
