import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CertiBid UI Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 my-6 rounded-2xl bg-[#0B3442] border border-[#FF6B7A]/40 text-[#F0FDFA] shadow-xl max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#FF6B7A]/20 text-[#FF6B7A] border border-[#FF6B7A]/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Something went wrong while loading this tender.</h3>
              <p className="text-xs text-[#A7C9CE] mt-0.5">
                The component encountered an unexpected error. You can retry loading or refresh the view.
              </p>
            </div>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="p-3 rounded-xl bg-[#071F2A] border border-[#1B5968] text-xs font-mono text-[#FF6B7A] overflow-x-auto">
              {this.state.error.toString()}
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-[#14D9D5] hover:bg-[#14D9D5]/90 text-[#071F2A] font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 text-[#A7C9CE] hover:text-white border border-[#1B5968] text-xs font-bold transition-all cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
