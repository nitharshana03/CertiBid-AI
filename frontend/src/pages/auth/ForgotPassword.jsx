// CertiBid AI - Forgot Password Page
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Password reset code sent to your email address.', 'success');
      navigate('/verify-otp', { state: { email } });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#071F2A] flex items-center justify-center p-4 text-[#F0FDFA]">
      <div className="w-full max-w-md bg-[#0B3442] border border-[#1B5968] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#06B6B4] text-[#071F2A] font-black flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
          <p className="text-xs text-[#A7C9CE]">Enter your registered government or corporate email address.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#A7C9CE] font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6F9BA3] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#103D4A] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-[#071F2A] font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Sending OTP...' : 'Send Verification OTP'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#1B5968] text-xs">
          <Link to="/login" className="text-[#14D9D5] hover:underline font-bold">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
