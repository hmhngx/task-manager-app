declare module 'react-datepicker' {
  import { Component } from 'react';

  interface DatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    showTimeSelect?: boolean;
    dateFormat?: string;
    className?: string;
    placeholderText?: string;
    required?: boolean;
  }

  const DatePicker: React.FC<DatePickerProps>;
  export default DatePicker;
}
