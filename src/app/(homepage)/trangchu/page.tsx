"use client";

import { BookOpen, GraduationCap, TrendingUp, Users } from "lucide-react";

type OverviewCard = {
  icon: typeof Users;
  value: string;
  label: string;
  trend: string;
};

type OngoingClass = {
  id: string;
  title: string;
  meta: string;
  progress: number;
};

const overviewCards: OverviewCard[] = [
  { icon: Users, value: "248", label: "Học viên đang học", trend: "+12%" },
  { icon: BookOpen, value: "18", label: "Chương trình hoạt động", trend: "+3" },
  { icon: GraduationCap, value: "42", label: "Giảng viên", trend: "+5" },
  { icon: TrendingUp, value: "87%", label: "Tỷ lệ hoàn thành", trend: "+4%" },
];

const ongoingClasses: OngoingClass[] = [
  {
    id: "1",
    title: "Chương trình Điều dưỡng Đa khoa K12",
    meta: "28 học viên · BS. Nguyễn Thị B • 10/15 bài học",
    progress: 65,
  },
  {
    id: "2",
    title: "Kỹ thuật Xét nghiệm Y học K8",
    meta: "15 học viên · TS. Trần Văn C • 5/12 bài học",
    progress: 42,
  },
  {
    id: "3",
    title: "Chuyên khoa Cấp cứu Tim mạch K5",
    meta: "22 học viên · BS. Lê Thị D • 9/10 bài học",
    progress: 88,
  },
];

export default function TrangChuPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
            >
              <div className="mb-5 flex items-start justify-between">
                <Icon className="h-5 w-5 text-[#9ca3af]" />
                <span className="text-xs font-semibold text-[#16a34a]">{card.trend}</span>
              </div>
              <p className="text-[36px] font-semibold leading-none text-[#111827]">{card.value}</p>
              <p className="mt-2 text-sm text-[#6b7280]">{card.label}</p>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <header className="border-b border-[#e5e7eb] px-5 py-4">
          <h2 className="text-[26px] font-bold leading-tight text-[#111827]">
            Lớp học đang diễn ra
          </h2>
        </header>

        <div>
          {ongoingClasses.map((item, index) => (
            <article
              key={item.id}
              className={`px-5 py-4 ${index !== ongoingClasses.length - 1 ? "border-b border-[#e5e7eb]" : ""}`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[20px] font-semibold text-[#111827]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[#6b7280]">{item.meta}</p>
                </div>
                <div className="text-right">
                  <p className="text-[24px] font-semibold leading-none text-[#1f2937]">{item.progress}%</p>
                  <p className="mt-1 text-sm text-[#9ca3af]">Hoàn thành</p>
                </div>
              </div>

              <div className="h-2 w-full rounded-full bg-[#f3f4f6]">
                <div
                  className="h-2 rounded-full bg-[#2563eb] transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
