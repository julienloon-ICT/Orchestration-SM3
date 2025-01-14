# Orchestration-SM3 Repository

Welcome to the Orchestration-SM3 Repository! This repository contains everything you need to automate and manage HR processes. Below you'll find the key components of this project, including **Worksphere**, PowerShell scripts, and the Active Directory API.

---

## Contents

- [Folder Structure](#folder-structure)
- [About Worksphere](#about-worksphere)
- [PowerShell Scripts](#powershell-scripts)
- [Active Directory API](#active-directory-api)
- [Installation](#installation)
- [Usage](#usage)

---

## Folder Structure

Here is an overview of the main folders and files in this repository:

```
ORCHESTRATION-SM3/
├── ad-user-api/
│   ├── pm2-service-install.ps1
│   ├── server.js
│   ├── service.js
│   ├── uninstall.js
│   └── package.json
├── JulianLoontjens.local_Powershell/
│   ├── PowerShell/
│   │   ├── Create_Department_Folders.ps1
│   │   ├── Create_Groups.ps1
│   │   ├── Create_OUs.ps1
│   │   ├── Create_User_In_AD_Working_Backup.ps1
│   │   ├── Create_User_In_AD.ps1
│   │   ├── Create_VM_in_vSphere.ps1
│   │   ├── Disable_User_In_AD.ps1
│   │   └── Shutdown_VM.ps1
│   
├── worksphere/
│   ├── api/
│   ├── app/
│   ├── docker-compose.yml
├── .gitignore
└── README.md
```


- **`ad-user-api/`**: Contains scripts and configurations for integrating with Active Directory.
- **`JulianLoontjens.local_Powershell/`**: A collection of PowerShell scripts to automate tasks like onboarding and offboarding.
- **`worksphere/`**: Core HR system folder with API, frontend app, and related services.
- **`docker-compose.yml`**: Configuration file for setting up the environment with Docker.

---

## About Worksphere

**Worksphere** is a custom-built HR system designed to automate key HR processes, such as employee onboarding and offboarding.

### Features:
- Employee information management
- Seamless integration with Active Directory
- Customizable workflows
- Detailed reporting and audit logs

Worksphere simplifies HR workflows, providing an efficient way to manage personnel data and streamline administrative tasks.

---

## PowerShell Scripts

The PowerShell scripts located in the `JulianLoontjens.local_Powershell/` folder are intended to automate and manage various HR-related tasks, including:

- **Onboarding**: Automatically create new users and assign necessary permissions.
- **Offboarding**: Remove access rights and archive user data upon departure.
- **Test Scripts**: For debugging and validating various HR processes.

These scripts can be executed individually to automate specific HR functions.

---

## Active Directory API

The **Active Directory API** found in the `ad-user-api/` folder is a Node.js-based application that allows you to interact with Active Directory.

Key functionalities include:
- **User management**: Add, update, or delete users in Active Directory.
- **Group membership management**: Assign or remove users from AD groups.
- **Automation**: Use REST APIs to interact with Active Directory programmatically.

### Key Files:
- **`server.js`**: Main server file to run the API.
- **`service.js`**: Contains the logic for making this script a servcie.
- **`pm2-service-install.ps1`**: PowerShell script for setting up the service with PM2.

---

## Installation

### Requirements
- **Node.js** (v14 or higher)
- **PowerShell** (v5.1 or higher)
- **Docker** (for containerized setup)
- Access to an **Active Directory server**

### Installation Steps:
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/orchestration-sm3.git

2. Install dependencies for the API:
   ```bash
   cd ad-user-api
   npm install
   ```
3. Start the Docker container:
   ```bash
   docker-compose up
   ```
4. Configure the `.env` files in the `worksphere/` and `ad-user-api/` directories.

---

## Usage

### Worksphere
Navigate to the URL where Worksphere is hosted and log in to manage HR processes.

## PowerShell Scripts

The PowerShell scripts located in the `JulianLoontjens.local_Powershell/` folder are designed to automate key HR tasks and system management operations. Below is a list of the available scripts along with a brief description of their functionality:

### Scripts:

- **`Create Department Folders.ps1`**: Automates the creation of department-specific folders within your file system to organize employee data or documents.
- **`Create_Groups.ps1`**: Creates necessary user groups in Active Directory, typically used for role-based access control.
- **`Create_OU’s.ps1`**: Automates the creation of Organizational Units (OUs) in Active Directory to manage users, groups, and computers in a structured way.
- **`Create_User_In_AD_Working_Backup.ps1`**: Creates a new user in Active Directory, with a focus on maintaining a backup of their data in case of a rollback or reversion.
- **`Create_User_In_AD.ps1`**: Automates the creation of new users in Active Directory, including the assignment of necessary attributes and permissions.
- **`Create_VM_in_vSphere.ps1`**: Automates the creation of virtual machines in **vSphere**, streamlining the deployment of new machines for onboarding or other purposes.
- **`Disable_User_In_AD.ps1`**: Disables a user account in Active Directory, which is typically part of the offboarding process.
- **`Shutdown_VM.ps1`**: Shuts down virtual machines in **vSphere**, often used for VM maintenance or decommissioning.

### Usage:
To run any of these PowerShell scripts, simply execute them from the PowerShell console like so:
```powershell
. .\path\to\Create_User_In_AD.ps1

### Active Directory API
Start the API server:
```bash
cd ad-user-api
node server.js
```
Then use a REST client such as Postman to make API calls.

---

© 2025 Julian Loontjens
