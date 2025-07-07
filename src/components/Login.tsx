import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';

interface LoginProps {
  onLogin: (user: { phone: string }) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.phone === phone);
    if (!user) {
      setError('User not found. Please register.');
      return;
    }
    if (user.password !== password) {
      setError('Incorrect password.');
      return;
    }
    onLogin({ phone });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-pink-100 to-purple-100 py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium">Cell Phone Number</label>
              <input
                type="tel"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full" variant="default">Login</Button>
          </form>
          <div className="text-center mt-6">
            <Button variant="link" type="button" onClick={onSwitchToRegister} className="text-blue-600">
              Don't have an account? Register
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 