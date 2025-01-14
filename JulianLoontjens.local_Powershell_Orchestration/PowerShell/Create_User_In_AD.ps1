#Parameters
param (
    [Parameter(Mandatory=$true)]
    [string]$EmployeeNumber,

    [Parameter(Mandatory=$true)]
    [string]$Initials,

    [Parameter(Mandatory=$true)]
    [string]$FirstName,

    [Parameter(Mandatory=$true)]
    [string]$LastName,

    [Parameter(Mandatory=$true)]
    [string]$Username,

    [Parameter(Mandatory=$true)]
    [string]$Department,

    [Parameter(Mandatory=$true)]
    [string]$Password
)

# Mapping van afdelingen naar OU's
$OUMap = @{
    "HR"          = "OU=HR,OU=Regular Users,OU=Users,OU=Prod,DC=julianloontjens,DC=local"
    "IT"          = "OU=IT,OU=Regular Users,OU=Users,OU=Prod,DC=julianloontjens,DC=local"
    "Management"  = "OU=Management,OU=Regular Users,OU=Users,OU=Prod,DC=julianloontjens,DC=local"
    "Marketing"   = "OU=Marketing,OU=Regular Users,OU=Users,OU=Prod,DC=julianloontjens,DC=local"
    "Finance"     = "OU=Finance,OU=Regular Users,OU=Users,OU=Prod,DC=julianloontjens,DC=local"
    "Operations"  = "OU=Operations,OU=Regular Users,OU=Users,OU=Prod,DC=julianloontjens,DC=local"
    "Sales"       = "OU=Sales,OU=Regular Users,OU=Users,OU=Prod,DC=julianloontjens,DC=local"
    "Legal"       = "OU=Legal,OU=Regular Users,OU=Users,OU=Prod,DC=julianloontjens,DC=local"
    "Research"    = "OU=Research,OU=Regular Users,OU=Users,OU=Prod,DC=julianloontjens,DC=local"
    "Support"     = "OU=Support,OU=Regular Users,OU=Users,OU=Prod,DC=julianloontjens,DC=local"
}

# Controleer of de afdeling bestaat in de mapping
if (-not $OUMap.ContainsKey($Department)) {
    Write-Host "Onbekend department: $Department. Het script wordt gestopt." -ForegroundColor 'Red'
    exit
}

# Organizational Unit (OU) ophalen op basis van het departement
$OU = $OUMap[$Department]

# Controleer of de gebruiker al bestaat
$ExistingUser = Get-ADUser -Filter { SamAccountName -eq $Username }

if ($ExistingUser) {
    Write-Host "De gebruiker $Username bestaat al in Active Directory." -ForegroundColor 'Red'
    exit
}

# Volledige naam opbouwen
$FullName = "$LastName, $Initials ($FirstName)"

# Domein
$Domain = "julianloontjens.local"

# Gebruiker aanmaken in de opgegeven OU
try {
    New-ADUser `
        -EmployeeNumber $EmployeeNumber `
        -SamAccountName $Username `
        -UserPrincipalName "$Username@$Domain" `
        -Name $FullName `
        -Initials $Initials `
        -GivenName $FirstName `
        -Surname $LastName `
        -DisplayName $FullName `
        -EmailAddress "$Username@$Domain" `
        -Department $Department `
        -ProfilePath "\\SR-WSR-02\UserProfiles$\$Username" `
        -AccountPassword (ConvertTo-SecureString $Password -AsPlainText -Force) `
        -Path $OU `
        -Enabled $true `
        -PasswordNeverExpires $false `
        -ChangePasswordAtLogon $true

    Write-Host "Gebruiker $FullName is succesvol aangemaakt." -ForegroundColor 'Green'
} catch {
    Write-Host "Er is een fout opgetreden bij het aanmaken van de gebruiker: $_" -ForegroundColor 'Red'
    exit
}

# Toevoegen aan de juiste groep op basis van het departement
$GroupName = "SG_$Department"
$Group = Get-ADGroup -Filter { Name -eq $GroupName }

if ($Group) {
    try {
        Add-ADGroupMember -Identity $GroupName -Members $Username
        Write-Host "Gebruiker $FullName is succesvol toegevoegd aan de groep $GroupName." -ForegroundColor 'Green'
    } catch {
        Write-Host "Er is een fout opgetreden bij het toevoegen van de gebruiker aan de groep: $_" -ForegroundColor 'Red'
    }
} else {
    Write-Host "De groep $GroupName bestaat niet. Controleer of deze correct is aangemaakt." -ForegroundColor 'Red'
}