# Define the base path for the OU creation
$baseOU = "OU=Regular Users,OU=Users,OU=Prod,DC=julianloontjens,DC=local"

# List of departments to create as OUs
$departments = @(
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

# Loop through the departments and create the OUs
foreach ($department in $departments) {
    $ouPath = "OU=$department,$baseOU"
    if (-not (Get-ADOrganizationalUnit -Filter "Name -eq '$department'" -SearchBase $baseOU -ErrorAction SilentlyContinue)) {
        New-ADOrganizationalUnit -Name $department -Path $baseOU
    Write-Host "OU '$department' created at path: $ouPath"
    } else {
    Write-Host "OU '$department' already exists."
    }
}