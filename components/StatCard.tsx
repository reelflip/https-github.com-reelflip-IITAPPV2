import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'slate';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  subValue, 
  icon, 
  color = 'blue', 
  onClick, 
  className = '' 
}) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-50 text-slate-600',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between transition-all h-full ${onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md' : ''} ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
         {icon && (
           <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
             {icon}
           </div>
         )}
         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">{label}</span>
      </div>
      <div>
         <span className="text-3xl font-bold text-slate-800 tracking-tight">{value}</span>
         {subValue && <p className="text-xs text-slate-500 mt-1 font-medium">{subValue}</p>}
      </div>
    </div>
  );
};