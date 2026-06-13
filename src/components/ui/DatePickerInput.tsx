'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import type { DatePickerProps } from 'react-datepicker';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { vi } from 'date-fns/locale';

export interface DatePickerInputProps {
  /** Giá trị ngày (Date | null) */
  selected?: Date | null;
  /** Callback khi chọn ngày */
  onChange: (date: Date | null) => void;
  /** Định dạng hiển thị, mặc định dd/MM/yyyy */
  dateFormat?: string;
  /** Placeholder ô nhập */
  placeholder?: string;
  /** Disabled */
  disabled?: boolean;
  /** Có hiển thị chọn giờ (time picker) không */
  showTimeSelect?: boolean;
  /** Bước phút cho time picker */
  timeIntervals?: number;
  /** ClassName cho wrapper */
  className?: string;
  /** Ngày tối thiểu */
  minDate?: Date;
  /** Ngày tối đa */
  maxDate?: Date;
  /** Class cho popper (dropdown lịch) */
  popperClassName?: string;
  /**
   * Vị trí lịch so với ô nhập (Floating UI). Mặc định `bottom-start` giống popper chuẩn, neo theo input.
   */
  popperPlacement?: React.ComponentProps<typeof DatePicker>['popperPlacement'];
}

const defaultDateFormat = 'dd/MM/yyyy';

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, onChange, disabled, placeholder }, ref) => (
    <div className="relative w-full group">
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        onClick={onClick}
        disabled={disabled}
        placeholder={placeholder ?? 'DD/MM/YYYY'}
        className="w-full h-[34px] px-3 pr-10 bg-white text-sm border border-gray-300 rounded-md
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 hover:border-blue-400 transition-all duration-200 ease-in-out
                 disabled:bg-gray-100 disabled:cursor-not-allowed"
        autoComplete="off"
      />
      <span
        className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-400
                   group-hover:text-blue-500 transition-colors duration-200 ease-in-out
                   ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-blue-600'}`}
        onClick={disabled ? undefined : onClick}
        aria-hidden
      >
        <FaRegCalendarAlt size={16} />
      </span>
    </div>
  )
);

CustomInput.displayName = 'DatePickerCustomInput';

/**
 * DatePicker thống nhất: lịch + dropdown chọn tháng/năm + nút "Hôm nay" + locale Vi.
 * Cấu hình tương tự project IT-Support (Popper neo input, không `withPortal`).
 * `strategy: 'fixed'` giúp lịch không bị cắt bởi `overflow` trong modal, vẫn đồng bộ vị trí với ô nhập.
 */
export function DatePickerInput({
  selected,
  onChange,
  dateFormat = defaultDateFormat,
  placeholder = 'DD/MM/YYYY',
  disabled = false,
  showTimeSelect = false,
  timeIntervals = 15,
  className,
  minDate,
  maxDate,
  popperClassName,
  popperPlacement = 'bottom-start',
}: DatePickerInputProps) {
  const handleChangeRaw: DatePickerProps['onChangeRaw'] = (event) => {
    const el = event && 'target' in event ? event.target : null;
    const value = el instanceof HTMLInputElement ? el.value ?? '' : '';
    if (value && value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = value.split('/');
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      if (!isNaN(date.getTime())) {
        onChange(date);
      }
    }
  };

  return (
    <DatePicker
      selected={selected ?? null}
      onChange={onChange}
      dateFormat={showTimeSelect ? `${dateFormat} HH:mm` : dateFormat}
      customInput={<CustomInput placeholder={placeholder} disabled={disabled} />}
      showPopperArrow={false}
      todayButton="Hôm nay"
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      locale={vi}
      monthsShown={1}
      showTimeSelect={showTimeSelect}
      timeIntervals={timeIntervals}
      timeCaption="Giờ"
      timeFormat="HH:mm"
      className={className ?? 'w-full'}
      disabled={disabled}
      onChangeRaw={handleChangeRaw}
      minDate={minDate}
      maxDate={maxDate}
      popperPlacement={popperPlacement}
      popperProps={{ strategy: 'fixed' }}
      popperClassName={[popperClassName, '!z-[10050]'].filter(Boolean).join(' ') || undefined}
    />
  );
}

export default DatePickerInput;
