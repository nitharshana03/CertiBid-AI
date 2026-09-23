// CertiBid AI - Reusable Breadcrumb Navigation Component
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

/**
 * Breadcrumb Component
 * @param {Array<{ label: string, path?: string }>} items - Breadcrumb items list
 * @example
 * <Breadcrumb items={[{ label: 'Procurement', path: '/dashboard' }, { label: 'Settings' }]} />
 */
export function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#A7C9CE] mb-4">
      <Link
        to="/dashboard"
        className="flex items-center gap-1.5 text-[#A7C9CE] hover:text-[#14D9D5] transition-colors font-medium"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Procurement</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-[#6F9BA3] shrink-0" />
            {isLast || !item.path ? (
              <span className="font-bold text-white text-[#14D9D5]">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className="text-[#A7C9CE] hover:text-[#14D9D5] transition-colors font-medium"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
