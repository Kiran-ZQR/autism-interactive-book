import React from 'react';

export function Alert({ 
  children, 
  variant = 'default' 
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'destructive' | 'warning'; 
}) {
  const variantClasses = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800'
  };
  
  return (
    <div className={`p-4 mb-4 border rounded-md ${variantClasses[variant]}`}>
      {children}
    </div>
  );
}
