param(
    [string]$vmName,
    [string]$username
)

# Functie om .env bestand te importeren en omgevingsvariabelen in te stellen
function Import-DotEnv {
    param([string]$envFilePath)

    if (Test-Path $envFilePath) {
        $envContent = Get-Content $envFilePath
        foreach ($line in $envContent) {
            if ($line -match '^\s*#') { continue }
            if ($line -match '^\s*$') { continue }

            $key, $value = $line -split '=', 2
            $key = $key.Trim()
            $value = $value.Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value)
        }
    } else {
        Write-Host ".env bestand niet gevonden op pad: $envFilePath" -ForegroundColor 'Red'
        exit
    }
}

# Pad naar .env bestand
$envFilePath = "\\sr-wsr-02\Shares\ServiceAccounts\Scripts\Powershell\.env"

# Importeer omgevingsvariabelen
Import-DotEnv -envFilePath $envFilePath

# Stel certificaatwaarschuwingen in op negeren
Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false

# vCenter-inloggegevens
$vcServer = [System.Environment]::GetEnvironmentVariable("VCENTER_SERVER")
$vcUsername = [System.Environment]::GetEnvironmentVariable("VCENTER_USERNAME")
$vcPassword = [System.Environment]::GetEnvironmentVariable("VCENTER_PASSWORD")

if (-not $vcServer -or -not $vcUsername -or -not $vcPassword) {
    Write-Host "Een of meer omgevingsvariabelen ontbreken in het .env bestand." -ForegroundColor 'Red'
    exit
}

# Maak verbinding met vCenter
Connect-VIServer -Server $vcServer -User $vcUsername -Password $vcPassword

# Zoek de VM en schakel deze uit als deze aan staat
$vm = Get-VM -Name $vmName -ErrorAction SilentlyContinue
if ($vm -eq $null) {
    Write-Host "VM '$vmName' niet gevonden." -ForegroundColor 'Red'
    exit
} elseif ($vm.PowerState -eq "PoweredOn") {
    Stop-VM -VM $vm -Confirm:$false
    Write-Host "VM '$vmName' is succesvol uitgeschakeld." -ForegroundColor 'Green'
} else {
    Write-Host "VM '$vmName' is al uitgeschakeld." -ForegroundColor 'Blue'
}