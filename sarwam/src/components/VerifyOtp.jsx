import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location?.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error('Email and OTP are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/otp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('OTP verified. Redirecting to login...');
        // small delay so toast is visible before navigation
        setTimeout(() => navigate('/login'), 1000);
        return;
      }

      // verification failed
      toast.error(data.error || 'OTP verification failed. Redirecting to home...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      toast.error('Network error: ' + err.message);
      setTimeout(() => navigate('/'), 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 20 }}>
      <Toaster position="top-right" />
      <h2>Verify OTP</h2>
      <form onSubmit={handleVerify}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    </div>
  );
}
