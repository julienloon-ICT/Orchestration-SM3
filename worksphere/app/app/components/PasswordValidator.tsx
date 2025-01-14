import React from 'react';

interface PasswordValidatorProps {
  password: string;
}

const PasswordValidator: React.FC<PasswordValidatorProps> = ({ password }) => {
  const criteria = [
    { test: password.length >= 8, message: 'At least 8 characters' },
    { test: /[A-Z]/.test(password), message: 'At least one uppercase letter' },
    { test: /[a-z]/.test(password), message: 'At least one lowercase letter' },
    { test: /[0-9]/.test(password), message: 'At least one number' },
    { test: /[\W_]/.test(password), message: 'At least one special character' },
  ];

  const allValid = criteria.every(criterion => criterion.test);

  return (
    <div role="status" aria-live="polite" aria-relevant="all" className="mt-2">
      <ul className="list-disc pl-5 text-sm text-gray-600">
        {criteria.map((criterion, index) => (
          <li key={index} className={criterion.test ? 'text-green-600' : 'text-red-600'}>
            {criterion.message}
          </li>
        ))}
      </ul>
      {!allValid && (
        <p className="mt-2 text-red-600">Your password does not meet all criteria.</p>
      )}
      {allValid && (
        <p className="mt-2 text-green-600">Your password is strong!</p>
      )}
    </div>
  );
};

export default PasswordValidator;
