// /routes/admin.js

const express = require('express');
const { pool } = require('../config/database');
const authenticateToken = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');  // Voeg deze regel toe
const axios = require('axios'); // Nieuwe import voor axios

const router = express.Router();

// GET all users
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM users');
        res.json(results);
    } catch (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error querying database');
    }
});

// POST add a new user
router.post('/users', authenticateToken, async (req, res) => {
    const { username, password, first_name, last_name, email_address, isEnabled } = req.body;
    
    // Hash the password before storing it
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, password, first_name, last_name, email_address, isEnabled) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, first_name, last_name, email_address, isEnabled]
        );
        res.status(201).send('User created successfully');
    } catch (err) {
        console.error('Error creating user in database:', err);
        res.status(500).send('Error creating user in database');
    }
});

// PUT update a user
router.put('/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { username, password, first_name, last_name, email_address, isEnabled } = req.body;

    try {
        let query = 'UPDATE users SET username = ?, first_name = ?, last_name = ?, email_address = ?, isEnabled = ?';
        const updates = [username, first_name, last_name, email_address, isEnabled];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            updates.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        updates.push(id);

        await pool.query(query, updates);
        res.status(200).send('User updated successfully');
    } catch (err) {
        console.error('Error updating user in database:', err);
        res.status(500).send('Error updating user in database');
    }
});

// DELETE delete a user
router.delete('/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // Haal de tokens op van de gebruiker die verwijderd wordt
        const [tokens] = await connection.query('SELECT token FROM user_tokens WHERE user_id = ?', [id]);

        // Voeg de tokens toe aan de blacklist met vervaldatum
        for (const { token } of tokens) {
            const decoded = jwt.decode(token);
            if (decoded && decoded.exp) {
                const expiresAt = moment.tz(decoded.exp * 1000, 'Europe/Amsterdam').format('YYYY-MM-DD HH:mm:ss');
                console.log(`Decoded token: ${token}, Expires at: ${expiresAt}`);
                await connection.query('INSERT INTO blacklist_tokens (token, expires_at) VALUES (?, ?)', [token, expiresAt]);
            } else {
                await connection.query('INSERT INTO blacklist_tokens (token) VALUES (?)', [token]);
            }
        }

        // Verwijder de gebruiker
        await connection.query('DELETE FROM users WHERE id = ?', [id]);
        
        await connection.commit();
        res.status(200).send('User deleted and tokens blacklisted successfully');
    } catch (err) {
        await connection.rollback();
        console.error('Error deleting user from database:', err);
        res.status(500).send('Error deleting user from database');
    } finally {
        connection.release();
    }
});

// GET all employees
router.get('/employees', authenticateToken, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM employees');
        res.json(results);
    } catch (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error querying database');
    }
});

// GET count of employees
router.get('/employees/count', authenticateToken, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT COUNT(*) AS count FROM employees');
        const count = results[0].count;
        res.json({ count });
    } catch (err) {
        console.error('Error fetching employees count:', err);
        res.status(500).send('Error fetching employees count');
    }
});

// POST add a new employee member and create in AD and VM
router.post('/employees', authenticateToken, async (req, res) => {
    const { username, first_name, last_name, initials, department, employee_email, isActive, password } = req.body;

    try {
        const [result] = await pool.query('SELECT MAX(employee_number) AS max_number FROM employees');
        const maxNumber = result[0].max_number || 99999;
        const newEmployeeNumber = maxNumber + 1;

        await pool.query(
            'INSERT INTO employees (employee_number, initials, username, first_name, last_name, department, employee_email, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newEmployeeNumber, initials, username, first_name, last_name, department, employee_email, isActive]
        );

        const adApiUrl = 'http://192.168.1.10:3003/api/createUser';
        const adResponse = await axios.post(adApiUrl, {
            employeeNumber: newEmployeeNumber,
            initials: initials,
            firstName: first_name,
            lastName: last_name,
            username: username,
            department: department,
            password: password,
        });

        // Controleer of AD-creatie succesvol is
        if (adResponse.status !== 201) {
            return res.status(500).send('Employee member created, but failed to add user to AD');
        }

        // Parameters voor VM-creatie
        const vmApiUrl = 'http://192.168.1.10:3003/api/createVM';
        const vmName = `WS-${username}-${newEmployeeNumber}`;
        const vmParams = {
            vmName: vmName,
        };

        // API-aanroep naar VM-creatiescript
        const vmResponse = await axios.post(vmApiUrl, vmParams);

        if (vmResponse.status === 201) {
            res.status(201).send('Employee member created, user added to AD, and VM created in vSphere');
        } else {
            res.status(500).send('Employee member created and user added to AD, but failed to create VM');
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error creating employee member');
    }
});


// PUT update a employee member
router.put('/employees/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { username, first_name, last_name, initials, department, employee_email, isActive } = req.body;

    try {
        const query = 'UPDATE employees SET username = ?, initials = ?, first_name = ?, last_name = ?, department = ?, employee_email = ?, isActive = ? WHERE id = ?';
        const updates = [username, initials, first_name, last_name, department, employee_email, isActive, id];

        await pool.query(query, updates);
        res.status(200).send('Employee member updated successfully');
    } catch (err) {
        console.error('Error updating employee member in database:', err);
        res.status(500).send('Error updating employee member in database');
    }
});

// DELETE delete an employee member
router.delete('/employees/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Haal de gebruikersinformatie op, zoals de `username`, voor de AD- en VM-aanroepen
        const [userResults] = await pool.query('SELECT username, employee_number FROM employees WHERE id = ?', [id]);

        if (userResults.length === 0) {
            return res.status(404).send('Employee member not found');
        }

        const { username, employee_number } = userResults[0];

        // Verwijder de gebruiker uit het HR-systeem
        await pool.query('DELETE FROM employees WHERE id = ?', [id]);

        // API-aanroep om de gebruiker in AD uit te schakelen
        const disableUserApiUrl = 'http://192.168.1.10:3003/api/disableUser';
        const disableUserResponse = await axios.post(disableUserApiUrl, { username });

        if (disableUserResponse.status !== 200) {
            return res.status(500).send('Employee member deleted from HR, but failed to disable user in AD');
        }

        // Optioneel: API-aanroep om de VM uit te schakelen
        const shutdownVmApiUrl = 'http://192.168.1.10:3003/api/shutdownVM';
        const vmName = `WS-${username}-${employee_number}`;

        const shutdownVmResponse = await axios.post(shutdownVmApiUrl, { vmName });

        if (shutdownVmResponse.status !== 200) {
            return res.status(500).send('Employee deleted from HR and disabled in AD, but failed to shutdown VM');
        }

        res.status(200).send('Employee deleted from HR, disabled in AD, and VM shutdown');
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error deleting employee member');
    }
});


module.exports = router;
