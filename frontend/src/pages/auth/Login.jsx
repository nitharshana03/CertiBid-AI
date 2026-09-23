// CertiBid AI - Login Page
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      let data = {};
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn("Non-JSON API response received:", text);
        data = { message: response.ok ? "Logged in" : "Authentication failed. Invalid email or password." };
      }

      if (!response.ok) {
        const errorText = data.message || "Email not registered. Please register first.";
        setErrorMessage(errorText);
        showToast(errorText, "error");
        setLoading(false);
        return;
      }

      const token = data.token || '';
      const role = data.role || 'BIDDER';
      const userProfile = data.user || { email, role };

      if (token) {
        localStorage.setItem('certibid_token', token);
        localStorage.setItem('token', token);
      }

      login(userProfile, role);
      showToast("Signed in successfully!", "success");

      const upperRole = String(role).toUpperCase().trim();
      if (upperRole === "ADMIN") {
        navigate("/dashboard/admin");
      } else if (upperRole === "OFFICER") {
        navigate("/dashboard/officer");
      } else if (upperRole === "BIDDER" || upperRole === "VENDOR") {
        navigate("/dashboard/vendor");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      const fallbackErr = "Unable to connect to authentication server";
      setErrorMessage(fallbackErr);
      showToast(fallbackErr, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071F2A] text-[#F0FDFA] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#06B6B4]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#0B3442] rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 border border-[#1B5968]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#06B6B4] flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-[#06B6B4]/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white">CertiBid AI Authentication</h2>
          <p className="text-xs text-[#A7C9CE] mt-1">Government Procurement Risk & Verification Portal</p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#FF6B7A]/15 border border-[#FF6B7A]/30 text-[#FF6B7A] text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#A7C9CE] mb-1">Official Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#A7C9CE]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@certibid.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#071F2A] border border-[#1B5968] text-white text-xs focus:ring-2 focus:ring-[#06B6B4] font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#A7C9CE]">Security Password</label>
              <Link to="/forgot-password" className="text-[11px] text-[#14D9D5] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#A7C9CE]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#071F2A] border border-[#1B5968] text-white text-xs focus:ring-2 focus:ring-[#06B6B4] font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#A7C9CE] pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-[#071F2A] border-[#1B5968] text-[#06B6B4] focus:ring-[#06B6B4]"
              />
              <span>Remember session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 group mt-2 cursor-pointer"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-xs text-[#A7C9CE] mt-6">
          New vendor?{' '}
          <Link to="/register" className="text-[#14D9D5] font-bold hover:underline">
            Register Company Profile
          </Link>
        </p>
      </div>
    </div>
  );
}

