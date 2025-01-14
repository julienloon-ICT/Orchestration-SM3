# Define the base OU where the groups will be created (central location)
$baseOU = "OU=Groups,OU=Prod,DC=julianloontjens,DC=local"

# List of departments to create groups for
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

# Loop through the departments and create the groups with the SG_ prefix in /Prod/Groups
foreach ($department in $departments) {
    $groupName = "SG_$department"
    if (-not (Get-ADGroup -Filter "Name -eq '$groupName'" -SearchBase $baseOU -ErrorAction SilentlyContinue)) {
    New-ADGroup -Name $groupName -GroupScope Global -GroupCategory Security -Path $baseOU
    Write-Host "Group '$groupName' created in OU: $baseOU"
    } else {
    Write-Host "Group '$groupName' already exists."
    }
}