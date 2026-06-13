'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

type ModuleKind = 'document' | 'poll';

type CourseModule = {
  id: string;
  title: string;
  kind: ModuleKind;
  description?: string;
  openAt?: string;
  closeAt?: string;
};

type CourseTopic = {
  id: string;
  order: number;
  title: string;
  modules: CourseModule[];
};

const TOPICS: CourseTopic[] = [
  {
    id: 'hcm-01',
    order: 1,
    title: 'Chủ đề HCM 01',
    modules: [
      {
        id: 'tai-lieu-2',
        title: 'Tài liệu 2',
        kind: 'document',
        description: 'mô tả 2',
      },
      {
        id: 'binh-chon',
        title: 'Bình chọn',
        kind: 'poll',
        openAt: '07:00 13/06/2026',
        closeAt: '11:00 13/06/2026',
      },
    ],
  },
];

type SelectedNode =
  | { type: 'topic'; topicId: string }
  | { type: 'module'; topicId: string; moduleId: string };

type DanhMucLopHocPanelProps = {
  onAddModule?: () => void;
};

function FunctionMenuButton({ label = 'Chức năng' }: { label?: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded border border-white/40 bg-white/10 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-white/20"
    >
      {label}
      <ChevronDown className="h-4 w-4" aria-hidden />
    </button>
  );
}

function ModuleHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#b8dce8] bg-[#00a8e8] px-4 py-2.5">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <FunctionMenuButton />
    </div>
  );
}

export default function DanhMucLopHocPanel({ onAddModule }: DanhMucLopHocPanelProps) {
  const [editMode, setEditMode] = useState(true);
  const [selected, setSelected] = useState<SelectedNode>({
    type: 'topic',
    topicId: TOPICS[0]?.id ?? '',
  });

  const selectedTopic = useMemo(() => {
    const topicId = selected.type === 'topic' ? selected.topicId : selected.topicId;
    return TOPICS.find((t) => t.id === topicId) ?? TOPICS[0];
  }, [selected]);

  const highlightedModuleId = selected.type === 'module' ? selected.moduleId : null;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
      <aside className="overflow-hidden rounded-sm border border-[#cfd8dc] bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-[#cfd8dc] bg-[#f5f7f9] px-4 py-3">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0088cc]"
          >
            Danh mục lớp học
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>

          <label className="inline-flex cursor-pointer items-center gap-2">
            <span className="text-sm text-[#374151]">Sửa nội dung</span>
            <span className="relative inline-flex h-6 w-11 items-center">
              <input
                type="checkbox"
                checked={editMode}
                onChange={(e) => setEditMode(e.target.checked)}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-full bg-[#cbd5e1] transition-colors peer-checked:bg-[#0088cc]" />
              <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </span>
          </label>
        </div>

        <nav className="px-4 py-4" aria-label="Danh mục lớp học">
          {TOPICS.map((topic) => {
            const isTopicSelected = selected.type === 'topic' && selected.topicId === topic.id;

            return (
              <div key={topic.id} className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelected({ type: 'topic', topicId: topic.id })}
                  className={`w-full text-left text-sm font-semibold transition-colors ${
                    isTopicSelected ? 'text-[#0088cc]' : 'text-[#111827] hover:text-[#0088cc]'
                  }`}
                >
                  {topic.order}. {topic.title}
                </button>

                <ul className="space-y-2 pl-5">
                  {topic.modules.map((module) => {
                    const isModuleSelected =
                      selected.type === 'module' &&
                      selected.topicId === topic.id &&
                      selected.moduleId === module.id;

                    return (
                      <li key={module.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelected({
                              type: 'module',
                              topicId: topic.id,
                              moduleId: module.id,
                            })
                          }
                          className={`inline-flex items-center gap-2 text-sm transition-colors ${
                            isModuleSelected
                              ? 'font-semibold text-[#0088cc]'
                              : 'text-[#374151] hover:text-[#0088cc]'
                          }`}
                        >
                          <span className="text-[#6b7280]" aria-hidden>
                            ◆
                          </span>
                          {module.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>

      <section className="overflow-hidden rounded-sm border border-[#cfd8dc] bg-white">
        {selectedTopic ? (
          <>
            <div className="flex items-center justify-between gap-3 bg-[#0088cc] px-4 py-3">
              <h2 className="text-lg font-semibold text-white">{selectedTopic.title}</h2>
              <FunctionMenuButton />
            </div>

            <div className="space-y-0 p-4">
              {selectedTopic.modules.map((module, index) => {
                const isHighlighted =
                  highlightedModuleId === null || highlightedModuleId === module.id;

                return (
                  <article
                    key={module.id}
                    id={`module-${module.id}`}
                    className={`overflow-hidden rounded-sm border border-[#cfd8dc] transition-opacity ${
                      index > 0 ? 'mt-4' : ''
                    } ${isHighlighted ? 'opacity-100' : 'opacity-60'}`}
                  >
                    <ModuleHeader title={module.title} />

                    {module.kind === 'document' ? (
                      <div className="px-4 py-4">
                        <p className="text-sm font-semibold text-[#111827]">Mô tả</p>
                        <p className="mt-2 text-sm text-[#374151]">{module.description}</p>
                      </div>
                    ) : (
                      <div className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm font-semibold text-[#111827]">Thời gian mở</p>
                            <p className="mt-1 text-sm text-[#374151]">{module.openAt}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#111827]">Thời gian đóng</p>
                            <p className="mt-1 text-sm text-[#374151]">{module.closeAt}</p>
                          </div>
                        </div>

                        <div className="my-4 border-t border-dotted border-[#b0bec5]" />

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            className="rounded-sm bg-[#5b9bd5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a8ac4]"
                          >
                            Ngoài giờ điểm danh
                          </button>
                          <button
                            type="button"
                            className="rounded-sm bg-[#70ad47] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5f9638]"
                          >
                            In QR code
                          </button>
                          <button
                            type="button"
                            className="rounded-sm bg-[#009999] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008080]"
                          >
                            Xem danh sách
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {editMode ? (
              <div className="flex justify-center border-t border-[#cfd8dc] px-4 py-5">
                <button
                  type="button"
                  onClick={onAddModule}
                  className="inline-flex items-center gap-1 rounded-sm border border-[#cfd8dc] bg-[#f8fafc] px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#eef2f6]"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Thêm module
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <p className="px-4 py-8 text-sm text-[#6b7280]">Chưa có nội dung.</p>
        )}
      </section>
    </div>
  );
}
