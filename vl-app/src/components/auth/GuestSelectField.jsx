import { ChevronDown } from 'lucide-react';
import {
  CONTROL_BASE,
  CONTROL_OK,
  CONTROL_ERR,
  buildDescribedBy,
} from '../../data/guestOptions';

/**
 * Accessible labelled <select> control shared across Guest registration and Guest profile forms.
 */
export default function GuestSelectField({
  id,
  name,
  label,
  required = false,
  allowEmpty = false,
  autoComplete,
  value,
  error,
  options,
  selectRef,
  onChange,
  onBlur,
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="block text-[14px] font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <select
          ref={selectRef}
          id={id}
          name={name}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={buildDescribedBy(null, errorId, Boolean(error))}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`${CONTROL_BASE} appearance-none pr-10 cursor-pointer ${value ? 'text-slate-900' : 'text-slate-500'} ${error ? CONTROL_ERR : CONTROL_OK}`}
        >
          <option value="" disabled={required && !allowEmpty}>--Select--</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-slate-900">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

