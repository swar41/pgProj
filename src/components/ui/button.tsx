import React from 'react';
import posthog from 'posthog-js';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  trackEventName?: string; // Optional prop for PostHog tracking
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  trackEventName,
  onClick,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (trackEventName) {
      // Track event with PostHog
      posthog.capture(trackEventName, { timestamp: new Date().toISOString() });
    }

    // Call the original onClick handler if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      className={`py-2 px-4 rounded-md ${
        variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-white border text-gray-900'
      } hover:opacity-90`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
