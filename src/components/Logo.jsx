import React from 'react';

const Logo = ({ size = 'md', variant = 'default' }) => {
  const sizes = {
    sm: { img: 'w-8 h-8', text: 'text-base' },
    md: { img: 'w-10 h-10', text: 'text-lg' },
    lg: { img: 'w-16 h-16', text: 'text-2xl' },
  };

  const s = sizes[size] || sizes.md;
  const textColor = variant === 'white' ? 'text-white' : 'text-primary';

  return (
    <div className="flex items-center">
      <img src="/icon.svg" alt="AgriTrace" className={s.img} />
      <span className={`${s.text} font-bold ${textColor} ml-2`}>AgriTrace</span>
    </div>
  );
};

export default Logo;
