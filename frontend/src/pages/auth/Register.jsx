// CertiBid AI - Vendor Registration
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Building2, ArrowRight, AlertCircle } from 'lucide-react';

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    category: 'Information Technology & Security',
    contactPerson: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      let data = {};
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn("Non-JSON API response received:", text);
        data = { message: response.ok ? "Registered successfully" : "Registration failed. Please check details." };
      }

      if (!response.ok) {
        const errorText = data.message || "Registration failed. Please check details.";
        setErrorMessage(errorText);
        showToast(errorText, "error");
        setLoading(false);
        return;
      }

      const token = data.token || '';
      const role = data.role || 'BIDDER';
      const userProfile = data.user || { email: formData.email, role: 'BIDDER' };

      if (token) {
        localStorage.setItem('certibid_token', token);
        localStorage.setItem('token', token);
      }

      login(userProfile, role);
      showToast("Registration successful! Navigating to Bidder Portal...", "success");
      navigate("/dashboard/vendor");
    } catch (err) {
      console.error("Registration request failed:", err);
      const fallbackErr = "Unable to connect to registration server";
      setErrorMessage(fallbackErr);
      showToast(fallbackErr, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071F2A] text-[#F0FDFA] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-xl bg-[#0B3442] border border-[#1B5968] rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#06B6B4]/20 text-[#14D9D5] flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Bidder Company Registration</h2>
          <p className="text-xs text-[#A7C9CE] mt-1">Fill in company details to create an official Bidder account</p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#FF6B7A]/15 border border-[#FF6B7A]/30 text-[#FF6B7A] text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A7C9CE] mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                name="companyName"
                placeholder="e.g. Acme Tech Solutions Inc."
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#071F2A] border border-[#1B5968] text-white text-xs font-medium focus:ring-2 focus:ring-[#06B6B4]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#A7C9CE] mb-1">Tax Identification Number (TIN)</label>
              <input
                type="text"
                required
                name="taxId"
                placeholder="TAX-990129301"
                value={formData.taxId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#071F2A] border border-[#1B5968] text-white text-xs font-medium focus:ring-2 focus:ring-[#06B6B4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A7C9CE] mb-1">Primary Procurement Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#071F2A] border border-[#1B5968] text-white text-xs font-medium focus:ring-2 focus:ring-[#06B6B4]"
              >
                <option value="Information Technology & Security">Information Technology & Security</option>
                <option value="Civil Engineering & Construction">Civil Engineering & Construction</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Healthcare & IT">Healthcare & IT</option>
                <option value="Environmental Engineering">Environmental Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#A7C9CE] mb-1">Official Representative Name</label>
              <input
                type="text"
                required
                name="contactPerson"
                placeholder="Dr. Jane Doe"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#071F2A] border border-[#1B5968] text-white text-xs font-medium focus:ring-2 focus:ring-[#06B6B4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A7C9CE] mb-1">Official Corporate Email</label>
              <input
                type="email"
                required
                name="email"
                placeholder="contact@company.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#071F2A] border border-[#1B5968] text-white text-xs font-medium focus:ring-2 focus:ring-[#06B6B4]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#A7C9CE] mb-1">Corporate Phone</label>
              <input
                type="tel"
                required
                name="phone"
                placeholder="+1 (555) 019-2831"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#071F2A] border border-[#1B5968] text-white text-xs font-medium focus:ring-2 focus:ring-[#06B6B4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A7C9CE] mb-1">Account Password</label>
            <input
              type="password"
              required
              name="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#071F2A] border border-[#1B5968] text-white text-xs font-medium focus:ring-2 focus:ring-[#06B6B4]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] disabled:opacity-50 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{loading ? "Registering..." : "Complete Registration & Go to Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-[#A7C9CE] mt-6">
          Already registered? <Link to="/login" className="text-[#14D9D5] font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

