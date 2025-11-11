import React, { useState } from 'react';

interface RegisterProps {
  onRegister: (user: { phone: string }) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!/^\d{10,15}$/.test(phone)) {
      setError('Please enter a valid cell phone number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: any) => u.phone === phone)) {
      setError('A user with this phone number already exists.');
      return;
    }
  const newUser = { phone, password, wallet: 0 };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setSuccess('Registration successful! You can now log in.');
    setTimeout(() => {
      onRegister({ phone });
    }, 1000);
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Cell Phone Number</label>
          <input
            type="tel"
            className="w-full border rounded px-3 py-2"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            pattern="[0-9]{10,15}"
            placeholder="e.g. 0821234567"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">Register</button>
      </form>
      <div className="text-center mt-4">
        <button className="text-blue-600 underline" onClick={onSwitchToLogin}>
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
};

export default Register; 