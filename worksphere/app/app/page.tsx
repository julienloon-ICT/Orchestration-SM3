// /app/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import FrontendNavBar from './components/FrontendNavBar'; // Import the navigation bar
import Notification from './components/Notification'; // Ensure you have this component

const HomePage: React.FC = () => {
    const [notification, setNotification] = useState<string | null>(null);

    // Simulate a fetch function (for future features)
    useEffect(() => {
        // You can make API calls here if needed
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
            {/* Add navigation bar */}
            <FrontendNavBar />

            <div className="flex flex-col items-center justify-center flex-grow p-8">
                {/* Main Title */}
                <h1 className="text-6xl font-bold mb-4 text-gray-900 dark:text-white animate-fade-in">
                    Welcome to WorkSphere
                </h1>
                <p className="text-lg mb-8 text-gray-700 dark:text-gray-300 text-center animate-fade-in">
                    Your Go-To Hub for Effortless HR Management
                </p>

                {/* Notification */}
                {notification && (
                    <Notification
                        message={notification}
                        type="success"
                        onClose={() => setNotification(null)}
                    />
                )}

                {/* Main content */}
                <main className="flex flex-col items-center w-full max-w-4xl">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg mb-8 animate-slide-up transition-transform transform hover:scale-105">
                        <h2 className="text-4xl font-semibold mb-4 text-gray-900 dark:text-white">
                            What We Offer
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            Manage your workforce, track performance, and simplify your HR processes—all in one platform.
                        </p>
                    </div>

                    {/* Features grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
                        {[
                            {
                                title: "Performance Tracking",
                                description: "Keep track of employee performance with our intuitive dashboards.",
                            },
                            {
                                title: "Time Management",
                                description: "Easily manage time-off requests and working hours.",
                            },
                            {
                                title: "Employee Engagement",
                                description: "Foster a positive work environment with our engagement tools.",
                            },
                            {
                                title: "Data Analytics",
                                description: "Make informed decisions with our detailed analytics reports.",
                            },
                        ].map((feature, index) => (
                            <div 
                                key={index} 
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                            >
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Call to Action Button */}
                    <button
                        className="bg-blue-600 text-white py-3 px-8 rounded hover:bg-blue-700 transition duration-200 mb-4"
                        aria-label="Get Started with WorkSphere"
                        onClick={() => setNotification("Get Started with WorkSphere!")}
                    >
                        Get Started
                    </button>

                    <div className="text-gray-600 dark:text-gray-400 text-center">
                        <p className="text-sm">
                            Explore our features and tools to enhance your HR management experience.
                        </p>
                    </div>
                </main>

                {/* Footer */}
                <footer className="mt-auto w-full text-center py-4 border-t border-gray-300 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} WorkSphere. All Rights Reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default HomePage;
