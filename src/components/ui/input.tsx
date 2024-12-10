import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  input?: string; // Action name for tracking
};

export const Input = ({ input, ...props }: InputProps) => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (input) {
      console.log(`Input field focused: ${input}`); // Replace with actual GA tracking logic
      if (window.gtag) {
        window.gtag('event', 'focus', {
          event_category: 'Input',
          event_label: input, // Use the `gaAction` as the label for the event
        });
      }
    }
    // Trigger the original onFocus handler passed via props
    props.onFocus?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (input) {
      console.log(`Input field value changed: ${input}`); // Replace with actual GA tracking logic
      if (window.gtag) {
        window.gtag('event', 'change', {
          event_category: 'Input',
          event_label: input, // Use the `gaAction` as the label for the event
        });
      }
    }
    // Trigger the original onChange handler passed via props
    props.onChange?.(e);
  };

  return (
    <input
      {...props}
      className={`border px-4 py-2 rounded ${props.className}`}
      onFocus={handleFocus} // Track focus event
      onChange={handleChange} // Track change event
    />
  );
};
