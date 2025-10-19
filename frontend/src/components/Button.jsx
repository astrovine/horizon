import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon = null,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    secondary: 'glass glass-hover text-primary',
    ghost: 'bg-transparent hover:bg-white/5 text-secondary hover:text-primary',
    danger: 'bg-danger hover:bg-danger/80 text-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <motion.button
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;

