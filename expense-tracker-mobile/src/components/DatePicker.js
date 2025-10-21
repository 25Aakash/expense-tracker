// Utility for cross-platform date picker
import React from 'react';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DatePicker({ value, onChange, mode = 'date', display = 'default', ...props }) {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        display={display}
        onChange={onChange}
        {...props}
      />
    );
  }
  // For web fallback, use a native input
  return (
    <input
      type="date"
      value={value.toISOString().split('T')[0]}
      onChange={e => onChange({ nativeEvent: { timestamp: new Date(e.target.value).getTime() } }, new Date(e.target.value))}
      {...props}
    />
  );
}
