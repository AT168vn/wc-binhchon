'use client';

import { useState } from 'react';
import { Building2, MapPin, Plus } from 'lucide-react';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';

type Facility = {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  capacity: number;
};

const FACILITIES: Facility[] = [
  {
    id: '1',
    name: 'Bệnh viện Tâm Anh Quận 7',
    code: 'BVTA-Q7',
    address: '1 Đường số 1, KDC Vạn Phúc, Q.7, TP.HCM',
    phone: '(028) 7102 6789',
    capacity: 500,
  },
  {
    id: '2',
    name: 'Bệnh viện Tâm Anh Hà Nội',
    code: 'BVTA-HN',
    address: '108 Hoàng Như Tiếp, Bồ Đề, Long Biên, Hà Nội',
    phone: '(024) 3872 3872',
    capacity: 400,
  },
];

type FacilityCardProps = {
  facility: Facility;
  onEdit: (facility: Facility) => void;
};

function FacilityCard({ facility, onEdit }: FacilityCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-[#e5e7eb] bg-white p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#ecfdf5] text-[#059669]"
          aria-hidden
        >
          <Building2 className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-[#111827]">{facility.name}</h3>
            <span className="inline-flex rounded-md bg-[#111827] px-2 py-0.5 text-xs font-medium text-white">
              {facility.code}
            </span>
          </div>

          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-[#6b7280]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{facility.address}</span>
          </p>

          <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b7280]">
            <span>SĐT: {facility.phone}</span>
            <span>Sức chứa: {facility.capacity} người</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEdit(facility)}
        className="inline-flex shrink-0 items-center justify-center self-start rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb] sm:self-center"
      >
        Chỉnh sửa
      </button>
    </article>
  );
}

export default function CoSoPage() {
  const { showSnackbar } = useAppSnackbar();
  const [facilities] = useState(FACILITIES);

  const handleAdd = () => {
    showSnackbar('Chức năng thêm cơ sở đang phát triển', 'success');
  };

  const handleEdit = (_facility: Facility) => {
    showSnackbar('Chức năng chỉnh sửa cơ sở đang phát triển', 'success');
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
        >
          <Plus className="h-4 w-4" />
          Thêm cơ sở
        </button>
      </div>

      <div className="space-y-3">
        {facilities.length > 0 ? (
          facilities.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} onEdit={handleEdit} />
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-[#e5e7eb] bg-white px-4 py-8 text-center text-sm text-[#6b7280]">
            Chưa có cơ sở nào. Nhấn &quot;Thêm cơ sở&quot; để tạo mới.
          </p>
        )}
      </div>
    </div>
  );
}
