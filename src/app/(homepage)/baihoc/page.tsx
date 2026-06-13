'use client';

import { useState } from 'react';
import DanhMucLopHocPanel from '@/components/noi-dung-lop-hoc/DanhMucLopHocPanel';
import ModalTaoBaiHoc from '@/components/baihoc/ModalTaoBaiHoc';
import { useAppSnackbar } from '@/contexts/AppSnackbarContext';

export default function BaiHocPage() {
  const { showSnackbar } = useAppSnackbar();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#eef1f4] p-4 md:p-5">
      <ModalTaoBaiHoc
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={() => showSnackbar('Đã lưu bài học', 'success')}
      />

      <DanhMucLopHocPanel onAddModule={() => setIsCreateModalOpen(true)} />
    </div>
  );
}
