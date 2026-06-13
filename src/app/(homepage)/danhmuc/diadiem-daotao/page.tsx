'use client';

import { useState } from 'react';
import { MapPin, Plus, Users } from 'lucide-react';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';

type LocationStatus = 'available' | 'in_use';

type TrainingLocation = {
  id: string;
  name: string;
  status: LocationStatus;
  facilityName: string;
  capacity: number;
  equipment: string;
};

const TRAINING_LOCATIONS: TrainingLocation[] = [
  {
    id: '1',
    name: 'Phòng đào tạo A - Tầng 3',
    status: 'available',
    facilityName: 'BVTA Quận 7',
    capacity: 50,
    equipment: 'Máy chiếu, Điều hòa, Bảng trắng',
  },
  {
    id: '2',
    name: 'Hội trường B - Tầng 1',
    status: 'in_use',
    facilityName: 'BVTA Quận 7',
    capacity: 120,
    equipment: 'Loa, Micro, Máy chiếu, Điều hòa',
  },
  {
    id: '3',
    name: 'Phòng thực hành C - Tầng 2',
    status: 'available',
    facilityName: 'BVTA Hà Nội',
    capacity: 30,
    equipment: 'Bàn ghế, Điều hòa, Tủ đựng dụng cụ',
  },
];

function LocationStatusBadge({ status }: { status: LocationStatus }) {
  if (status === 'available') {
    return (
      <span className="inline-flex rounded-md bg-[#111827] px-2 py-0.5 text-xs font-medium text-white">
        Còn trống
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md border border-[#e5e7eb] bg-[#f3f4f6] px-2 py-0.5 text-xs font-medium text-[#374151]">
      Đang sử dụng
    </span>
  );
}

type TrainingLocationCardProps = {
  location: TrainingLocation;
  onEdit: (location: TrainingLocation) => void;
};

function TrainingLocationCard({ location, onEdit }: TrainingLocationCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-[#e5e7eb] bg-white p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#f5f3ff] text-[#7c3aed]"
          aria-hidden
        >
          <MapPin className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-[#111827]">{location.name}</h3>
            <LocationStatusBadge status={location.status} />
          </div>

          <p className="mt-1.5 text-sm text-[#6b7280]">
            <span className="text-[#374151]">Cơ sở:</span> {location.facilityName}
          </p>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6b7280]">
            <Users className="h-4 w-4 shrink-0 text-[#9ca3af]" aria-hidden />
            <span>
              <span className="text-[#374151]">Sức chứa:</span> {location.capacity} người
            </span>
          </p>

          <p className="mt-1 text-sm text-[#6b7280]">
            <span className="text-[#374151]">Thiết bị:</span> {location.equipment}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEdit(location)}
        className="inline-flex shrink-0 items-center justify-center self-start rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb] sm:self-center"
      >
        Chỉnh sửa
      </button>
    </article>
  );
}

export default function DiaDiemDaoTaoPage() {
  const { showSnackbar } = useAppSnackbar();
  const [locations] = useState(TRAINING_LOCATIONS);

  const handleAdd = () => {
    showSnackbar('Chức năng thêm địa điểm đang phát triển', 'success');
  };

  const handleEdit = (_location: TrainingLocation) => {
    showSnackbar('Chức năng chỉnh sửa địa điểm đang phát triển', 'success');
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
          Thêm địa điểm
        </button>
      </div>

      <div className="space-y-3">
        {locations.length > 0 ? (
          locations.map((location) => (
            <TrainingLocationCard key={location.id} location={location} onEdit={handleEdit} />
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-[#e5e7eb] bg-white px-4 py-8 text-center text-sm text-[#6b7280]">
            Chưa có địa điểm đào tạo nào. Nhấn &quot;Thêm địa điểm&quot; để tạo mới.
          </p>
        )}
      </div>
    </div>
  );
}
