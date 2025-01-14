// /pages/backend/manage-employees/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Notification from '../../../components/Notification';
import PasswordValidator from '../../../components/PasswordValidator';

const ManageEmployeesPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    initials: '',
    employee_email: '',
    employee_number: '',
    department: 'HR', // default department
    isActive: true
  });
  const [editUser, setEditUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<number | null>(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await axios.get('http://192.168.1.9:3002/api/admin/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      setError('Error fetching users');
      console.error(err);
    }
  };
  

  const validatePassword = (password: string) => {
    // Stel eisen aan het wachtwoord, zoals minimaal 8 tekens, een hoofdletter, een kleine letter, een cijfer en een speciaal teken
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(password)) {
      return 'Password must be at least 8 characters long, include a number, a capital letter, a lowercase letter, and a special character.';
    }
    return null;
  };
  
  const validateUserFields = (user: any, isEdit = false) => {
    const { username, password, initials, first_name, last_name, employee_email, employee_number } = user;
    if (!username || !initials || !first_name || !last_name || !employee_email) {
      return 'All fields are required.';
    }
    if (!isEdit && !password) {
      return 'Password is required.';
    }
    
    // Check wachtwoord als het niet om een edit gaat of als er een nieuw wachtwoord is ingevoerd
    if (!isEdit || password) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        return passwordError;
      }
    }
    return null;
  };

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      if (!email.includes('@')) {
        return 'Email address must contain @';
      } else if (!email.includes('.')) {
        return 'Email address must contain a domain';
      } else {
        return 'Invalid email address';
      }
    }
    return null;
  };

  const addUser = async () => {
    const fieldError = validateUserFields(newUser);
    const emailError = validateEmail(newUser.employee_email);

    if (fieldError) {
      setWarningMessage(fieldError);
      return;
    }

    if (emailError) {
      setWarningMessage(`Faulty email address entered: ${emailError}`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      await axios.post('http://192.168.1.9:3002/api/admin/employees', newUser, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchUsers();
      setNewUser({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        initials: '',
        employee_email: '',
        employee_number: '',
        department: 'HR', // Reset to default
        isActive: true
      });
      setSuccessMessage('User successfully added!');
      setError(null);
    } catch (err) {
      setError('Error creating user');
      setSuccessMessage(null);
      console.error('Error creating user:', err);
    }
  };

  const updateUser = async () => {
    const emailError = validateEmail(editUser.employee_email);
    const fieldError = validateUserFields(editUser, true); // Pass true for edit mode

    if (emailError) {
      setWarningMessage(`Faulty email address entered: ${emailError}`);
      return;
    }

    if (fieldError) {
      setWarningMessage(fieldError);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      if (!editUser || !editUser.id) {
        throw new Error('No user selected for editing');
      }

      // Prepare the payload for updating the user
      const userToUpdate = { ...editUser, isActive: editUser.isActive ? 1 : 0 };

      // Remove the password if it's empty
      if (!userToUpdate.password) {
        delete userToUpdate.password;
      }

      await axios.put(`http://192.168.1.9:3002/api/admin/employees/${editUser.id}`, userToUpdate, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      fetchUsers();
      setEditUser(null);
      setSuccessMessage('User successfully updated!');
      setError(null);
    } catch (err) {
      setError('Error updating user');
      setSuccessMessage(null);
      console.error('Error updating user:', err);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      await axios.delete(`http://192.168.1.9:3002/api/admin/employees/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchUsers();
      setSuccessMessage('User successfully deleted!');
      setError(null);
      setConfirmDeleteUserId(null);
      if (expandedUserId === userId) {
        setExpandedUserId(null);
      }
    } catch (err) {
      setError('Error deleting user');
      setSuccessMessage(null);
      console.error('Error deleting user:', err);
    }
  };

  const handleConfirmDelete = (userId: number) => {
    setConfirmDeleteUserId(userId);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteUserId(null);
  };

  const toggleDetails = (userId: number) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
    }
  };

  const handleEditClick = (user: any) => {
    setEditUser({ ...user, password: '' });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setEditUser({
      ...editUser,
      [name]: newValue
    });
  };  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Manage employees</h1>
      {error && (
        <Notification
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
      {successMessage && (
        <Notification
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {warningMessage && (
        <Notification
          message={warningMessage}
          type="warning"
          onClose={() => setWarningMessage(null)}
        />
      )}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add employee</h2>
        <form className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
            />
            <PasswordValidator password={newUser.password}/>
          </div>
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={newUser.first_name}
              onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={newUser.last_name}
              onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="initials" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              Initials
            </label>
            <input
              type="text"
              id="initials"
              name="initials"
              value={newUser.initials}
              onChange={(e) => setNewUser({ ...newUser, initials: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="employee_email" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              Email
            </label>
            <input
              type="email"
              id="employee_email"
              name="employee_email"
              value={newUser.employee_email}
              onChange={(e) => setNewUser({ ...newUser, employee_email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={newUser.department}
              onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Management">Management</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Sales">Sales</option>
              <option value="Legal">Legal</option>
              <option value="Research">Research</option>
              <option value="Support">Support</option>
            </select>
          </div>
          <div className="col-span-2">
            <label htmlFor="isActive" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              Is Active?
            </label>
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={newUser.isActive}
              onChange={(e) => setNewUser({ ...newUser, isActive: e.target.checked })}
              className="mt-1 block"
            />
          </div>
        </form>
        <button
          type="button"
          onClick={addUser}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add User
        </button>
      </div>

      {/* Existing users list */}
      <h2 className="text-2xl font-bold my-6 text-gray-900 dark:text-white">Existing employees</h2>
      {users.length === 0 ? (
        <p className="text-gray-900 dark:text-gray-100">No employees available.</p>
      ) : (
        <ul className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {users.map((user) => (
            <li key={user.id} className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-4">
                <div className="text-gray-900 dark:text-gray-100">
                  <p className="font-medium">{user.last_name}, {user.initials} ({user.first_name}) </p>
                  <p className="text-sm">{user.username}</p>
                </div>
                <div className="space-x-4">
                  <button
                    onClick={() => toggleDetails(user.id)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {expandedUserId === user.id ? 'Hide Details' : 'View Details'}
                  </button>
                  <button
                    onClick={() => handleEditClick(user)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleConfirmDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {expandedUserId === user.id && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <p><strong>First name:</strong> {user.first_name}</p>
                  <p><strong>Initials:</strong> {user.initials}</p>
                  <p><strong>Last name:</strong> {user.last_name}</p>
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Email:</strong> {user.employee_email}</p>
                  <p><strong>Employee Number:</strong> {user.employee_number}</p>
                  <p><strong>Department:</strong> {user.department}</p>
                  <p><strong>Active:</strong> {user.isActive ? 'Yes' : 'No'}</p>
                  <p><strong>Created At:</strong> {new Date(user.created_at).toLocaleString('en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true
                  })}</p>
                </div>
              )}
              {confirmDeleteUserId !== null && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Confirm Deletion</h2>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">Are you sure you want to delete this user?</p>
                    <div className="flex justify-end">
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={() => deleteUser(confirmDeleteUserId!)}
                      >
                        Delete
                      </button>
                      <button
                        className="ml-4 px-4 py-2 bg-gray-200 text-gray-900 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={handleCancelDelete}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Edit user form */}
      {editUser && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl mt-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit employee</h2>
          <form className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="editUsername" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Username
              </label>
              <input
                type="text"
                id="editUsername"
                name="username"
                value={editUser.username}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="editPassword" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Password
              </label>
              <input
                type="password"
                id="editPassword"
                name="password"
                value={editUser.password}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              />
              <PasswordValidator password={editUser.password}/>
            </div>
            <div>
              <label htmlFor="editFirstName" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                First Name
              </label>
              <input
                type="text"
                id="editFirstName"
                name="first_name"
                value={editUser.first_name}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="editLastName" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Last Name
              </label>
              <input
                type="text"
                id="editLastName"
                name="last_name"
                value={editUser.last_name}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="editInitials" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Initials
              </label>
              <input
                type="text"
                id="editInitials"
                name="Initials"
                value={editUser.initials}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
                />
            </div>
            <div>
              <label htmlFor="editEmail" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Email
              </label>
              <input
                type="email"
                id="editEmail"
                name="employee_email"
                value={editUser.employee_email}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="editDepartment" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Department
              </label>
              <select
                id="editDepartment"
                name="department"
                value={editUser.department}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Management">Management</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
                <option value="Legal">Legal</option>
                <option value="Research">Research</option>
                <option value="Support">Support</option>
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor="editIsActive" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Is Active?
              </label>
              <input
                type="checkbox"
                id="editIsActive"
                name="isActive"
                checked={editUser.isActive}
                onChange={handleEditChange}
                className="mt-1 block"
              />
            </div>
          </form>
          <button
            type="button"
            onClick={updateUser}
            className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Update User
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageEmployeesPage;
