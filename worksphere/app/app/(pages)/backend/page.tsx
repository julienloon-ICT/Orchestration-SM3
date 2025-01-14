// /app/backend/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { getEmployeesBackend, getEmployeesCount, getRegisteredUsersCount } from '../../services/api';
import Notification from '../../components/Notification';
import RequireAuth from '../../components/RequireAuth'; // Importeer het RequireAuth component

interface Employee {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    initials: string;
    department: string;
    employee_email: string;
    employee_number: string;
    isActive: boolean;
    created_at: string; // Voeg created_at toe als dat nog niet is gedaan
    created_by: string; // Voeg created_by toe
}

const Dashboard: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [usersCount, setUsersCount] = useState<number>(0);
    const [employeesCount, setEmployeesCount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const employeesData = await getEmployeesBackend();
                setEmployees(employeesData);

                const usersCountData = await getRegisteredUsersCount();
                setUsersCount(usersCountData);

                const employeesCountData = await getEmployeesCount();
                setEmployeesCount(employeesCountData);
            } catch (err) {
                setError('Error fetching data');
                setNotification('Error fetching data');
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const latestEmployees = employees.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);

    return (
        <RequireAuth>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-8">
                <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Dashboard</h1>
                {notification && (
                    <Notification
                        message={notification}
                        type="error"
                        onClose={() => {
                            setNotification(null);
                            setError(null); // Reset error when notification is closed
                        }}
                    />
                )}
                {!notification && error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Registered Users</h2>
                        <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{usersCount}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Registered Employees</h2>
                        <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{employeesCount}</p>
                    </div>
                </div>
                <div className="mt-8 w-full max-w-4xl">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Latest Employees</h2>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <ul>
                            {latestEmployees.map((employee) => (
                                <li key={employee.id} className="border-b py-2">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{employee.last_name}, {employee.initials} ({employee.first_name})</h3>
                                    <p className="text-gray-700 dark:text-gray-300">Department: {employee.department}</p>
                                    <p className="text-gray-600 dark:text-gray-400">Created on {new Date(employee.created_at).toLocaleString('en-US', {
                                        year: 'numeric', month: '2-digit', day: '2-digit',
                                        hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true
                                    })}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </RequireAuth>
    );
};

export default Dashboard;