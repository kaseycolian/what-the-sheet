import type { StylesConfig } from 'react-select';
import type { SelectOption } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const neonStyles: StylesConfig<SelectOption, true> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#1a0038',
    borderColor: state.isFocused ? '#00ffff' : '#4400aa',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 255, 255, 0.35)' : 'none',
    '&:hover': { borderColor: '#00ffff' },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#120025',
    border: '1px solid #4400aa',
    boxShadow: '0 4px 20px rgba(255, 0, 255, 0.2)',
  }),
  menuList: (base) => ({ ...base, padding: 0 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'rgba(255, 0, 255, 0.25)'
      : state.isFocused
        ? 'rgba(255, 0, 255, 0.12)'
        : 'transparent',
    color: state.isSelected ? '#ff00ff' : '#f0ecff',
    cursor: 'pointer',
    ':active': { backgroundColor: 'rgba(255, 0, 255, 0.35)' },
  }),
  multiValue: (base) => ({ ...base, backgroundColor: 'rgba(255, 0, 255, 0.18)' }),
  multiValueLabel: (base) => ({ ...base, color: '#ff00ff', fontWeight: 600 }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#cc66ff',
    ':hover': { backgroundColor: 'rgba(255, 0, 255, 0.35)', color: '#ff00ff' },
  }),
  placeholder: (base) => ({ ...base, color: '#6655aa' }),
  singleValue: (base) => ({ ...base, color: '#f0ecff' }),
  input: (base) => ({ ...base, color: '#f0ecff' }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#9988bb',
    ':hover': { color: '#ff00ff' },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#9988bb',
    ':hover': { color: '#ff00ff' },
  }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: '#4400aa' }),
};

const classicStyles: StylesConfig<SelectOption, true> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#f9fafb',
    borderColor: state.isFocused ? '#2563eb' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px #bfdbfe' : 'none',
    '&:hover': { borderColor: '#3b82f6' },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
  }),
  menuList: (base) => ({ ...base, padding: 0 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#2563eb'
      : state.isFocused
        ? '#eff6ff'
        : 'transparent',
    color: state.isSelected ? '#ffffff' : '#111827',
    cursor: 'pointer',
    ':active': { backgroundColor: '#dbeafe' },
  }),
  multiValue: (base) => ({ ...base, backgroundColor: '#dbeafe' }),
  multiValueLabel: (base) => ({ ...base, color: '#1d4ed8' }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#3b82f6',
    ':hover': { backgroundColor: '#bfdbfe', color: '#1d4ed8' },
  }),
  placeholder: (base) => ({ ...base, color: '#9ca3af' }),
  singleValue: (base) => ({ ...base, color: '#111827' }),
  input: (base) => ({ ...base, color: '#111827' }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#6b7280',
    ':hover': { color: '#374151' },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#6b7280',
    ':hover': { color: '#374151' },
  }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: '#e5e7eb' }),
};

export function useReactSelectStyles(): StylesConfig<SelectOption, true> {
  const { theme } = useTheme();
  return theme === 'neon' ? neonStyles : classicStyles;
}
