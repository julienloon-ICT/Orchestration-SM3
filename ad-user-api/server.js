const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = 3003; // Je kunt deze poort aanpassen indien nodig

// Middleware
app.use(cors()); // Toestaan van cross-origin requests
app.use(bodyParser.json()); // Voor het verwerken van JSON-inhoud

// API route om een gebruiker aan te maken
app.post('/api/createUser', (req, res) => {
    const { employeeNumber, initials, firstName, lastName, username, department, password } = req.body;

    if (!employeeNumber || !initials || !firstName || !lastName || !username || !department || !password) {
        return res.status(400).json({ error: 'Alle parameters zijn verplicht.' });
    }

    // Pad naar het PowerShell script
    const scriptPath = "\\\\SR-WSR-02\\Shares\\ServiceAccounts\\Scripts\\Powershell\\Create_User_In_AD.ps1";

    // Command om het PowerShell script uit te voeren
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -EmployeeNumber "${employeeNumber}" -Initials "${initials}" -FirstName "${firstName}" -LastName "${lastName}" -Username "${username}" -Department "${department}" -Password "${password}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing PowerShell script: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Fout bij het uitvoeren van het script.' });
        }

        console.log(`PowerShell script output: ${stdout}`);
        res.status(201).json({ message: 'Gebruiker succesvol aangemaakt.' });
    });
});

// API route om een VM aan te maken in vSphere
app.post('/api/createVM', (req, res) => {
    const { vmName, templateName, datastoreName, clusterName, networkName, ipAddress, netmask, gateway, resourcePool, folderName } = req.body;

    // Controleer of alle vereiste parameters zijn meegegeven
    if (!vmName) {
        return res.status(400).json({ error: 'Alle parameters zijn verplicht.' });
    }

    // Pad naar het PowerShell script voor VM-creatie
    const scriptPath = "\\\\SR-WSR-02\\Shares\\ServiceAccounts\\Scripts\\Powershell\\Create_VM_In_vSphere.ps1";

    // Command om het PowerShell script uit te voeren met de vereiste parameters
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -VMName "${vmName}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing PowerShell script: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Fout bij het uitvoeren van het VM-creatiescript.' });
        }

        console.log(`PowerShell script output: ${stdout}`);
        res.status(201).json({ message: 'VM succesvol aangemaakt in vSphere.' });
    });
});

// Endpoint om een VM uit te schakelen
app.post('/api/shutdownVM', (req, res) => {
    const { vmName } = req.body;

    if (!vmName) {
        return res.status(400).json({ error: 'Parameter vmName is verplicht.' });
    }

    // Pad naar het PowerShell script voor het uitschakelen van een VM
    const scriptPath = "\\\\SR-WSR-02\\Shares\\ServiceAccounts\\Scripts\\Powershell\\Shutdown_VM.ps1";

    // Command om het PowerShell script uit te voeren
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -vmName "${vmName}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Shutdown_VM script: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Fout bij het uitvoeren van het shutdown script.' });
        }

        console.log(`Shutdown_VM script output: ${stdout}`);
        res.status(200).json({ message: 'VM succesvol uitgeschakeld.' });
    });
});

// Endpoint om een gebruiker in Active Directory uit te schakelen
app.post('/api/disableUser', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Parameter username is verplicht.' });
    }

    // Pad naar het PowerShell script voor het uitschakelen van een gebruiker
    const scriptPath = "\\\\SR-WSR-02\\Shares\\ServiceAccounts\\Scripts\\Powershell\\Disable_User_In_AD.ps1";

    // Command om het PowerShell script uit te voeren
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -username "${username}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Disable_User_In_AD script: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Fout bij het uitvoeren van het AD disable script.' });
        }

        console.log(`Disable_User_In_AD script output: ${stdout}`);
        res.status(200).json({ message: 'Gebruiker succesvol uitgeschakeld in Active Directory.' });
    });
});

// Start de server
app.listen(PORT, () => {
    console.log(`Server is running on http://192.168.1.10:${PORT}`);
});