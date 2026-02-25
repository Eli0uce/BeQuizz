import React from 'react';

export const Button = ({ children, onClick, className = '', variant = 'flat', disabled = false }) => {
  const baseClasses = "nm-btn px-6 py-3 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    flat: "nm-flat",
    inset: "nm-inset",
    primary: "nm-flat text-indigo-500",
    danger: "nm-flat text-red-500",
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', variant = 'flat' }) => {
  return (
    <div className={`nm-card ${variant === 'inset' ? 'nm-inset' : 'nm-flat'} ${className}`}>
      {children}
    </div>
  );
};

export const Input = ({ type = 'text', placeholder, value, onChange, className = '' }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`nm-input ${className}`}
    />
  );
};

export const ProgressBar = ({ progress, label, sublabel, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs mb-1 uppercase font-bold opacity-70">
        <span>{label}</span>
        <span>{sublabel}</span>
      </div>
      <div className="nm-inset h-4 rounded-full overflow-hidden p-1">
        <div 
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};
