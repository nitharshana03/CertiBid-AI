// CertiBid AI - Tender Creation Form Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Gavel, ArrowLeft, ArrowRight } from 'lucide-react';

export function TenderCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: 'Ministry of Road Transport & Highways',
    budget: 45000000,
    category: 'Public Infrastructure',
    description: '',
    deadline: '2026-09-30',
    location: 'Central Capital Region',
    emdPercentage: 2
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiService.createTender(formData);
      showToast('Tender published successfully to state procurement board.', 'success');
      navigate(`/tenders/${res.data.id}`);
    } catch (e) {
      showToast('Failed to create tender', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-[#F0FDFA] max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#A7C9CE] hover:text-white cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tenders
      </button>

      <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl">
        <h2 className="text-2xl font-extrabold text-white">Publish New Government Tender</h2>
        <p className="text-xs text-[#A7C9CE] mt-1">Configure budget allocations, department requirements, and EMD parameters.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-4 text-xs shadow-lg">
        <div>
          <label className="block text-[#A7C9CE] font-bold mb-1">Tender Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Smart Traffic Infrastructure Phase II"
            className="w-full px-3 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#A7C9CE] font-bold mb-1">Department</label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white"
            />
          </div>
          <div>
            <label className="block text-[#A7C9CE] font-bold mb-1">Category</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#A7C9CE] font-bold mb-1">Estimated Budget (₹ INR)</label>
            <input
              type="number"
              required
              value={formData.budget}
              onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white"
            />
          </div>
          <div>
            <label className="block text-[#A7C9CE] font-bold mb-1">Submission Deadline</label>
            <input
              type="date"
              required
              value={formData.deadline}
              onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#A7C9CE] font-bold mb-1">Scope of Work & Specification Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed procurement parameters, technical specifications, and vendor qualifications..."
            className="w-full px-3 py-2 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white"
          />
        </div>

        <div className="pt-4 border-t border-[#1B5968] flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-[#0B3442] text-[#A7C9CE] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-[#071F2A] font-extrabold shadow-md flex items-center gap-2 cursor-pointer"
          >
            {submitting ? 'Publishing...' : 'Publish Tender'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
