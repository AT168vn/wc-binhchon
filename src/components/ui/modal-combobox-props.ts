import type { Option } from '@/components/ui/CustomComboBox';

/** Khớp `inputClass` trong modal — viền/focus do khối bọc `focus-within` của combobox. */
const MODAL_FIELD_BASE =
  'bg-white text-sm leading-5 text-[#111827] placeholder:text-[#9ca3af]';

export const MODAL_COMBOBOX_CLASS = 'max-w-full w-full';

export const MODAL_COMBOBOX_INPUT_CLASS = `rounded-l-lg rounded-r-none px-3 ${MODAL_FIELD_BASE}`;

export const MODAL_COMBOBOX_TOGGLE_CLASS = `rounded-r-lg rounded-l-none bg-white ${MODAL_FIELD_BASE}`;

/** Style + hành vi combobox trong modal: chỉ hiện cột Tên, `ma` dùng nội bộ/API. */
export const modalComboBoxProps = {
  displayTenOnly: true,
  singleColumnHeader: 'Tên',
  controlSize: 'field' as const,
  className: MODAL_COMBOBOX_CLASS,
  inputClassName: MODAL_COMBOBOX_INPUT_CLASS,
  toggleButtonClassName: MODAL_COMBOBOX_TOGGLE_CLASS,
  portalDropdown: true,
} as const;

export function optionByMa(options: readonly Option[], ma?: string | null): Option | null {
  if (!ma) return null;
  return options.find((o) => o.ma === ma) ?? null;
}
