/**
 * Bảng màu eHealth: Professional Trust + Modern Wellness + Semantic status
 * Primary #007BFF, Sidebar Deep Navy #2C3E50, Background #F8F9FA, Surface #FFFFFF
 */
export const theme = {
  sidebarBg: '#2d3e50',
  menuText: '#ffffff',
  menuHoverBg: '#E9ECEF',
  menuHoverText: '#007BFF',
  borderLight: '#E9ECEF',
  primary: '#007BFF',
  primaryDark: '#0062CC',
  secondary: '#17A2B8',
  accent: '#007BFF',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  textPrimary: '#212529',
  statusPending: '#6C757D',
  statusProgress: '#007BFF',
  statusCompleted: '#28A745',
  statusUrgent: '#DC3545',
  focusRing: 'focus:ring-2 focus:ring-[#007BFF] focus:border-transparent',
  buttonPrimary: 'bg-[#007BFF] text-white hover:bg-[#0062CC]',
  tableHeaderClass:
    'px-4 py-3 text-sm font-semibold text-white uppercase tracking-wider border border-[#1a5a9e] text-center bg-[#206bc4]',
  blockTitleClass: 'bg-[#206bc4] px-4 py-2 text-base font-semibold text-white',
  tableCellClass: 'px-4 py-2 text-sm border border-[#E9ECEF]',
  inputClass:
    'w-full h-[34px] border border-[#E9ECEF] rounded px-3 text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent bg-white',
  labelClass: 'block text-sm font-medium text-[#212529] mb-1',
  blockClass: 'rounded-lg border border-[#E9ECEF] overflow-hidden bg-white shadow-sm',
} as const;

export type Theme = typeof theme;
