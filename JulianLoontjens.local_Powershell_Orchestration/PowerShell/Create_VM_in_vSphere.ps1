param(
    [string]$vmName
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

# Geef het pad naar je .env bestand
$envFilePath = "\\sr-wsr-02\Shares\ServiceAccounts\Scripts\Powershell\.env"

# Importeer de omgevingsvariabelen uit het .env bestand
Import-DotEnv -envFilePath $envFilePath

# Stel in dat certificaatwaarschuwingen genegeerd worden
Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false

# De CEIP-configuratie instellen om de waarschuwing te onderdrukken
Set-PowerCLIConfiguration -Scope User -ParticipateInCEIP $false -Confirm:$false

# Verbind met de vCenter server met behulp van gegevens uit het .env bestand
$vcServer = [System.Environment]::GetEnvironmentVariable("VCENTER_SERVER")
$vcUsername = [System.Environment]::GetEnvironmentVariable("VCENTER_USERNAME")
$vcPassword = [System.Environment]::GetEnvironmentVariable("VCENTER_PASSWORD")

if (-not $vcServer -or -not $vcUsername -or -not $vcPassword) {
    Write-Host "Een of meer omgevingsvariabelen ontbreken in het .env bestand." -ForegroundColor 'Red'
    exit
}

# Maak verbinding met vCenter
Connect-VIServer -Server $vcServer -User $vcUsername -Password $vcPassword

# VM variabelen
$resourcePool = "I528678"
$folderName = "I528678"
$template = "Template_Julian_WIN10-Edu_22H2"
$datastore = "DataCluster-Students"
$networkName = "2726_I528678_PVlanA"

# Zoek de folder
$folder = Get-Folder -Name $folderName
if (-not $folder) {
    Write-Host "De opgegeven folder '$folderName' is niet gevonden." -ForegroundColor 'Red'
    exit
}

# Check of de VM al bestaat, maak anders de VM aan
if (-not (Get-VM -Name $vmName -ErrorAction SilentlyContinue)) {
    Write-Debug "Creating a new VM from a template..." -ForegroundColor 'Green'
    $vm = New-VM -Name $vmName -Template $template -Datastore $datastore -ResourcePool $resourcePool -Location $folder
} else {
    Write-Host "VM met de naam '$vmName' bestaat al." -ForegroundColor 'Red'
    exit
}

# Controleer of een netwerkadapter al verbonden is met het opgegeven netwerk
$existingAdapter = Get-NetworkAdapter -VM $vm | Where-Object { $_.NetworkName -eq $networkName }

if ($existingAdapter) {
    Write-Host "Een netwerkadapter is al verbonden met '$networkName'. Er wordt geen nieuwe adapter toegevoegd." -ForegroundColor 'Blue'
} else {
    # Voeg een netwerkadapter toe en koppel deze aan het juiste netwerk
    $adapter = New-NetworkAdapter -VM $vm -NetworkName $networkName
    Set-NetworkAdapter -NetworkAdapter $adapter -Connected:$true -StartConnected:$true -Confirm:$false
    Write-Host "Nieuwe netwerkadapter gekoppeld aan '$networkName'." -ForegroundColor 'Green'
}

# Start de VM
Start-VM -VM $vm

# Wacht tot de VM is opgestart en een IP-adres heeft
Write-Host "Wachten tot de VM is opgestart en een IP-adres heeft..." -ForegroundColor 'Blue'

do {
    Start-Sleep -Seconds 5
    $vmIP = (Get-VM -Name $vmName | Get-VMGuest).IPAddress | Where-Object { $_ -match '\d+\.\d+\.\d+\.\d+' }
} while (-not $vmIP)

Write-Host "VM is opgestart met IP-adres: $vmIP" -ForegroundColor 'Green'

# Definieer de variabelen
$sshUser = "WS-admin"
$sshKeyPath = 'C:\Users\Administrator\.ssh\id_ecdsa'

# Domain and user details
$domainName = "julianloontjens.local"
$domainServiceUser = "JULIANLOONTJENS\su-worksphere"
$domainServicePassword = [System.Environment]::GetEnvironmentVariable("SERVICE_PASSWORD_DOMAIN")

# Define the domain check command to be executed over SSH
$checkDomain = "powershell -Command `"if ((Get-WmiObject -Class Win32_ComputerSystem).PartOfDomain) { Write-Output 'True' } else { Write-Output 'False' }`""

# Use Start-Process to run SSH command for domain check
$sshCommand = "ssh"
$sshArgs = "-i $sshKeyPath -o StrictHostKeyChecking=no $sshUser@$vmIP $checkDomain"

# Start SSH process and capture output
$process = Start-Process -FilePath $sshCommand -ArgumentList $sshArgs -NoNewWindow -RedirectStandardOutput "ssh_output.txt" -PassThru
$process.WaitForExit()

# Read the output from SSH
$checkDomainkResult = Get-Content -Path "ssh_output.txt" | Out-String

if ($checkDomainkResult -match 'False') {
    # Define variables for retry logic
    $maxRetries = 3
    $delayBetweenRetries = 10 # seconds

    # Prepare the renaming command first
    $renameCommand = "powershell -Command `"Rename-Computer -NewName '$vmName' -Force -Restart`""

    # Attempt to rename the computer
    for ($i = 0; $i -lt $maxRetries; $i++) {
        # Use Start-Process for the renaming command
        $sshArgs = "-i $sshKeyPath -o StrictHostKeyChecking=no $sshUser@$vmIP $renameCommand"
        $process = Start-Process -FilePath $sshCommand -ArgumentList $sshArgs -NoNewWindow -RedirectStandardOutput "rename_output.txt" -RedirectStandardError "rename_error.txt" -PassThru
        $process.WaitForExit()

        # Check for errors
        if ($process.ExitCode -eq 0) {
            Write-Host "Yes! Successfully renamed computer to: $vmName." -ForegroundColor 'Green'
            break
        } else {
            $renameError = Get-Content -Path "rename_error.txt" | Out-String
            Write-Host "Attempt $($i + 1): Failed to rename the computer. Error: $renameError" -ForegroundColor 'Red'
            Start-Sleep -Seconds $delayBetweenRetries
        }
    }

    # Now attempt to join the domain
    $joinCommand = "powershell -Command `"Add-Computer -Domain $domainName -Credential (New-Object System.Management.Automation.PSCredential('$domainServiceUser', (ConvertTo-SecureString '$domainServicePassword' -AsPlainText -Force))) -OUPath 'OU=Workstations,OU=Computers,OU=Prod,DC=julianloontjens,DC=local' -Restart -Force`""

    # Use Start-Process for the domain join command
    for ($i = 0; $i -lt $maxRetries; $i++) {
        $sshArgs = "-i $sshKeyPath -o StrictHostKeyChecking=no $sshUser@$vmIP $joinCommand"
        $process = Start-Process -FilePath $sshCommand -ArgumentList $sshArgs -NoNewWindow -RedirectStandardOutput "join_output.txt" -RedirectStandardError "join_error.txt" -PassThru
        $process.WaitForExit()

        # Check for errors
        if ($process.ExitCode -eq 0) {
            Write-Host "Yes! VM: $vmName with ($vmIP) has been added to $domainName domain." -ForegroundColor 'Green'
            break
        } else {
            $joinError = Get-Content -Path "join_error.txt" | Out-String
            Write-Host "Attempt $($i + 1): Failed to join the domain. Error: $joinError" -ForegroundColor 'Red'
            Start-Sleep -Seconds $delayBetweenRetries
        }
    }
} elseif ($checkDomainkResult -match 'True') {
    Write-Host "Oops... VM:$vmName with ($vmIP) is already in a domain." -ForegroundColor 'Red'
} else {
    Write-Error "Oh no. Couldn't check if $vmName is in domain." -ErrorAction Stop
}
