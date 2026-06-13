'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export interface Option {
  ma: string;
  ten: string;
  /** Cột Giá (khi bật `showIdTenGiaColumns`). */
  giaLabel?: string;
  originalData?: unknown;
}

/** Cha có overflow cuộn — `scroll` không bubble lên `window`, cần để cập nhật vị trí dropdown portal trong modal. */
function collectScrollContainers(start: HTMLElement | null): HTMLElement[] {
  const out: HTMLElement[] = [];
  let el: HTMLElement | null = start;
  while (el) {
    const st = window.getComputedStyle(el);
    const oy = st.overflowY;
    const ox = st.overflowX;
    const o = st.overflow;
    const scrollish =
      oy === 'auto' ||
      oy === 'scroll' ||
      oy === 'overlay' ||
      ox === 'auto' ||
      ox === 'scroll' ||
      ox === 'overlay' ||
      o === 'auto' ||
      o === 'scroll';
    if (scrollish) {
      out.push(el);
    }
    el = el.parentElement;
  }
  return out;
}

type Props = {
  id?: string;
  options: Option[];
  value: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Gộp thêm class cho khối bọc (vd: max-w-full trong modal) */
  className?: string;
  /** ClassName bổ sung cho input (vd: placeholder:text-blue-600). */
  inputClassName?: string;
  /** Chiều cao khối input + nút mũi tên (vd: `h-[34px]`). Bỏ qua khi `controlSize="field"`. */
  innerWrapperClassName?: string;
  /** ClassName nút mở danh sách (căn khớp `innerWrapperClassName`). */
  toggleButtonClassName?: string;
  /**
   * `compact`: ô cố định 34px (login, form cũ).
   * `field`: cùng `py-2` như input modal — không ép chiều cao.
   */
  controlSize?: 'compact' | 'field';
  /** Dropdown hiển thị hai cột ID và Tên (mặc định một cột Nội dung) */
  showIdAndTenColumns?: boolean;
  /** Ba cột: ID, Tên, Giá (dùng `option.giaLabel`). */
  showIdTenGiaColumns?: boolean;
  /** Ô nhập chỉ hiển thị `ten` (mã `ma` vẫn dùng nội bộ và khi gửi API qua originalData). */
  displayTenOnly?: boolean;
  /** Tiêu đề cột khi dropdown một cột (không dùng `showIdAndTenColumns`). Mặc định: Nội dung. */
  singleColumnHeader?: string;
  /** Bắt buộc chọn giá trị (Enter không chuyển ô khi chưa chọn). */
  required?: boolean;
  /**
   * true: danh sách render qua portal (fixed) — không bị modal/layout cắt do overflow.
   * false: absolute trong khối combobox (hành vi cũ).
   */
  portalDropdown?: boolean;
  /**
   * Tắt gợi ý lưu/tự điền của trình duyệt (mặc định true — chỉ dùng dropdown của combobox).
   */
  disableBrowserAutocomplete?: boolean;
};

export default function CustomComboBox({
  id,
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  disabled = false,
  className,
  inputClassName,
  innerWrapperClassName,
  toggleButtonClassName,
  controlSize = 'compact',
  showIdAndTenColumns = false,
  showIdTenGiaColumns = false,
  displayTenOnly = false,
  singleColumnHeader = 'Nội dung',
  required = false,
  portalDropdown = true,
  disableBrowserAutocomplete = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [portalPos, setPortalPos] = useState({ top: 0, left: 0, width: 380, maxHeight: 320 });
  /** Chặn autofill Chrome: readonly đến lần focus/click đầu tiên. */
  const [blockBrowserAutofill, setBlockBrowserAutofill] = useState(disableBrowserAutocomplete);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBlockBrowserAutofill(disableBrowserAutocomplete);
  }, [disableBrowserAutocomplete]);

  /** Luôn mở danh sách xuống dưới ô (không kéo lên trên) — tránh che vùng phía trên modal (bảng). Chiều cao tự co theo viewport. */
  const updatePortalPosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const minW = 380;
    const w = Math.max(rect.width, minW);
    let left = rect.left;
    if (left + w > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - w - 8);
    }
    const gap = 4;
    const maxListH = 320;
    const top = rect.bottom + gap;
    const spaceBelow = window.innerHeight - top - 8;
    const maxHeight = Math.max(96, Math.min(maxListH, spaceBelow));
    setPortalPos({ top, left, width: w, maxHeight });
  }, []);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    if (!required || disabled) {
      el.setCustomValidity('');
      return;
    }
    if (value != null) {
      el.setCustomValidity('');
    } else {
      el.setCustomValidity('Vui lòng chọn giá trị.');
    }
  }, [required, disabled, value]);

  useEffect(() => {
    if (value) {
      setDisplayValue(displayTenOnly ? value.ten : `${value.ma} - ${value.ten}`);
    } else {
      setDisplayValue('');
    }
  }, [value, displayTenOnly]);

  useLayoutEffect(() => {
    if (!isOpen || !portalDropdown) return;
    updatePortalPosition();
    const scrollOpts: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener('scroll', updatePortalPosition, scrollOpts);
    window.addEventListener('resize', updatePortalPosition);
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    vv?.addEventListener('resize', updatePortalPosition);
    vv?.addEventListener('scroll', updatePortalPosition);
    const anchor = anchorRef.current;
    const scrollParents = collectScrollContainers(anchor);
    scrollParents.forEach((node) => {
      node.addEventListener('scroll', updatePortalPosition, scrollOpts);
    });
    return () => {
      window.removeEventListener('scroll', updatePortalPosition, scrollOpts);
      window.removeEventListener('resize', updatePortalPosition);
      vv?.removeEventListener('resize', updatePortalPosition);
      vv?.removeEventListener('scroll', updatePortalPosition);
      scrollParents.forEach((node) => {
        node.removeEventListener('scroll', updatePortalPosition, scrollOpts);
      });
    };
  }, [isOpen, portalDropdown, updatePortalPosition]);

  const filtered = options.filter((item) => {
    const searchText = query.toLowerCase();
    const gia = (item.giaLabel ?? '').toLowerCase();
    return (
      item.ma.toLowerCase().includes(searchText) ||
      item.ten.toLowerCase().includes(searchText) ||
      gia.includes(searchText)
    );
  });

  const handleSelect = (item: Option) => {
    onChange(item);
    setDisplayValue(displayTenOnly ? item.ten : `${item.ma} - ${item.ten}`);
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setDisplayValue(newText);
    setQuery(newText);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (newText === '') {
      onChange(null);
    }
  };

  const unlockBrowserAutofill = () => {
    if (disableBrowserAutocomplete) {
      setBlockBrowserAutofill(false);
    }
  };

  const handleButtonClick = () => {
    unlockBrowserAutofill();
    inputRef.current?.focus();
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setHighlightedIndex(-1);
      setQuery('');
    }
  };

  const handleInputFocus = () => {
    unlockBrowserAutofill();
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!value && displayValue !== '') {
        setDisplayValue('');
        onChange(null);
      }
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  const dropdownPanel = (
    <div
      id={id ? `${id}-listbox` : undefined}
      role="listbox"
      ref={dropdownRef}
      className={clsx(
        'bg-white border border-gray-200 rounded shadow-lg overflow-auto',
        !portalDropdown && 'max-h-80'
      )}
      style={
        portalDropdown
          ? {
              position: 'fixed',
              top: portalPos.top,
              left: portalPos.left,
              width: portalPos.width,
              maxHeight: portalPos.maxHeight,
              zIndex: 20000,
            }
          : undefined
      }
    >
      <table className="w-full table-auto text-left">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {showIdTenGiaColumns ? (
              <>
                <th className="px-3 py-2 border border-gray-200 text-xs font-semibold w-16">ID</th>
                <th className="px-3 py-2 border border-gray-200 text-xs font-semibold min-w-[8rem]">Tên</th>
                <th className="px-3 py-2 border border-gray-200 text-xs font-semibold whitespace-nowrap w-28 text-right">
                  Giá
                </th>
              </>
            ) : showIdAndTenColumns ? (
              <>
                <th className="px-3 py-2 border border-gray-200 text-xs font-semibold w-16">ID</th>
                <th className="px-3 py-2 border border-gray-200 text-xs font-semibold">Tên</th>
              </>
            ) : (
              <th className="px-3 py-2 border border-gray-200 text-xs font-semibold">
                {singleColumnHeader}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {filtered.map((item, index) => (
            <tr
              key={item.ma}
              data-index={index}
              className={clsx(
                'hover:bg-blue-100 cursor-pointer',
                value?.ma === item.ma && 'bg-blue-50',
                highlightedIndex === index && 'bg-blue-100'
              )}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseDown={() => handleSelect(item)}
            >
              {showIdTenGiaColumns ? (
                <>
                  <td className="px-3 py-2 border border-gray-100 text-xs font-mono whitespace-nowrap">
                    {item.ma}
                  </td>
                  <td className="px-3 py-2 border border-gray-100 text-xs">{item.ten}</td>
                  <td className="px-3 py-2 border border-gray-100 text-xs text-right tabular-nums whitespace-nowrap">
                    {item.giaLabel ?? '—'}
                  </td>
                </>
              ) : showIdAndTenColumns ? (
                <>
                  <td className="px-3 py-2 border border-gray-100 text-xs font-mono whitespace-nowrap">
                    {item.ma}
                  </td>
                  <td className="px-3 py-2 border border-gray-100 text-xs">{item.ten}</td>
                </>
              ) : (
                <td className="px-3 py-2 border border-gray-100 text-xs">{item.ten}</td>
              )}
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={showIdTenGiaColumns ? 3 : showIdAndTenColumns ? 2 : 1}
                className="px-3 py-2 text-center text-gray-400 text-xs"
              >
                Không có kết quả
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      ref={anchorRef}
      className={clsx('relative w-full text-sm', className ?? 'max-w-sm')}
      data-combobox-open={isOpen ? 'true' : 'false'}
    >
      <div
        className={clsx(
          'flex w-full items-stretch',
          controlSize === 'compact' && 'h-[34px]',
          controlSize === 'field' &&
            clsx(
              'overflow-hidden rounded-lg border border-[#e5e7eb]',
              'focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb]',
              isOpen && 'border-[#2563eb] ring-1 ring-[#2563eb]',
            ),
          innerWrapperClassName,
        )}
      >
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={displayValue}
          required={required}
          readOnly={blockBrowserAutofill}
          aria-required={required ? true : undefined}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={id ? `${id}-listbox` : undefined}
          autoComplete={disableBrowserAutocomplete ? 'off' : undefined}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-lpignore="true"
          data-1p-ignore
          data-form-type="other"
          name={disableBrowserAutocomplete && id ? `cme-combobox-${id}` : undefined}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            if (!isOpen) return;
            e.preventDefault();
            if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
              handleSelect(filtered[highlightedIndex]);
            } else if (filtered.length === 1) {
              handleSelect(filtered[0]);
            }
          }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            'box-border min-w-0 flex-1 bg-white text-sm',
            controlSize === 'compact' &&
              'h-full rounded-l-md rounded-r-none border border-r-0 border-gray-300 px-2 leading-normal focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            controlSize === 'field' &&
              'h-auto rounded-none rounded-l-lg border-0 py-2 leading-5 shadow-none focus:border-transparent focus:outline-none focus:ring-0',
            disabled && 'cursor-not-allowed bg-gray-100',
            inputClassName,
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Mở danh sách"
          onClick={handleButtonClick}
          disabled={disabled}
          className={clsx(
            'flex shrink-0 items-center justify-center bg-gray-100',
            controlSize === 'compact' &&
              'h-full w-9 rounded-r-md border border-gray-300',
            controlSize === 'field' &&
              'w-8 rounded-none rounded-r-lg border-0 border-l border-[#e5e7eb] bg-white focus:outline-none',
            disabled && 'cursor-not-allowed opacity-50',
            toggleButtonClassName,
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          <ChevronDown className="h-4 w-4 shrink-0" />
        </button>
      </div>

      {isOpen &&
        (portalDropdown && typeof document !== 'undefined'
          ? createPortal(dropdownPanel, document.body)
          : <div className="absolute z-[9999] left-0 right-0 min-w-[380px] mt-1">{dropdownPanel}</div>)}
    </div>
  );
}
