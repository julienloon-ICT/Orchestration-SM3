param (
    [Parameter(Mandatory=$true)]
    [string]$Username
)

# Controleer of de gebruiker bestaat
$user = Get-ADUser -Filter { SamAccountName -eq $Username }

if ($user) {
    # Gebruiker uitschakelen
    Disable-ADAccount -Identity $user
    Write-Host "Gebruiker $Username gedeactiveerd in Active Directory." -ForegroundColor 'Green'
} else {
    Write-Host "Gebruiker $Username niet gevonden in Active Directory." -ForegroundColor 'Red'
}