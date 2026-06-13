'use client';

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import {
  sanitizeVnPhoneDigits,
  VN_PHONE_INVALID_MESSAGE,
} from '@/lib/phone-vn';

export interface VnPhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'maxLength'> {
  value: string;
  onChange: (nextDigits: string) => void;
  /** Nhãn — cùng hàng với thông báo lỗi (lỗi nằm bên phải). */
  label: ReactNode;
  /** Class cho thẻ label (không cần `mb-1`, khoảng cách do hàng label xử lý). */
  labelClassName?: string;
  /** Bắt buộc đủ 10 số (không cho để trống). */
  required?: boolean;
  /** Hiện dòng gợi ý dưới ô nhập. */
  showHint?: boolean;
}

const VnPhoneInput = forwardRef<HTMLInputElement, VnPhoneInputProps>(function VnPhoneInput(
  {
    value,
    onChange,
    label,
    labelClassName = 'text-sm font-medium text-gray-700',
    required = false,
    showHint = false,
    className = '',
    disabled,
    id: idProp,
    onBlur,
    placeholder = '',
    ...rest
  },
  ref
) {
  const genId = useId();
  const id = idProp ?? `vn-phone-${genId}`;
  const [touched, setTouched] = useState(false);

  const digits = sanitizeVnPhoneDigits(value);

  const errorMsg: string | null = !touched
    ? null
    : required && digits.length === 0
      ? 'Vui lòng nhập số điện thoại.'
      : digits.length > 0 && digits.length !== 10
        ? VN_PHONE_INVALID_MESSAGE
        : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(true);
    onChange(sanitizeVnPhoneDigits(e.target.value));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    onBlur?.(e);
  };

  const borderClass =
    errorMsg != null ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';

  const describedBy = [showHint ? `${id}-hint` : null, errorMsg ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex flex-col w-full min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-1 w-full min-w-0">
        <label htmlFor={id} className={`${labelClassName} shrink-0 min-w-0`}>
          {label}
        </label>
        {errorMsg != null ? (
          <span
            id={`${id}-error`}
            className="text-xs text-red-600 text-right leading-snug max-w-[min(100%,22rem)] ml-auto"
            role="alert"
          >
            {errorMsg}
          </span>
        ) : null}
      </div>
      <input
        ref={ref}
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        aria-invalid={errorMsg != null}
        aria-describedby={describedBy || undefined}
        disabled={disabled}
        value={digits}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${className} ${borderClass}`.trim()}
        {...rest}
      />
      {showHint && (
        <p id={`${id}-hint`} className="text-xs text-gray-500 mt-0.5">
          Nhập đúng 10 chữ số.
        </p>
      )}
    </div>
  );
});

export default VnPhoneInput;
