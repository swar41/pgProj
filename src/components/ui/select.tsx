import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options?: { value: string; label: string }[]; // List of options
  gaAction?: string; // Action name for tracking
  placeholder?: string; // Placeholder for the select dropdown
  onValueChange?: (value: string) => void; // Custom handler for value change
};

export const Select = ({
  options = [],
  className = '',
  gaAction,
  placeholder = 'Select',
  onValueChange,
  onChange,
  ...props
}: SelectProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    // Google Analytics tracking (if applicable)
    if (gaAction && window.gtag) {
      window.gtag('event', 'change', {
        event_category: 'Select',
        event_label: gaAction, // The label representing the action
        value: selectedValue, // Track the selected value
      });
    }

    // Trigger custom onValueChange handler (if provided)
    onValueChange?.(selectedValue);

    // Trigger native onChange handler (if provided)
    onChange?.(e);
  };

  return (
    <select
      className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent ${className}`}
      onChange={handleChange}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.length > 0 ? (
        options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      ) : (
        <option value="" disabled>
          No options available
        </option>
      )}
    </select>
  );
};

export default Select;
