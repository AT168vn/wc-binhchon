/**
 * Trả về URL ảnh logo custom từ env, hoặc null nếu dùng logo mặc định.
 * NEXT_PUBLIC_LOGO=NULL hoặc rỗng → null (giữ logo mặc định). 
 */
export function getCustomLogoUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_LOGO?.trim();
  if (!raw || raw.toUpperCase() === 'NULL') return null;

  let path = raw.replace(/\\/g, '/');
  const publicIndex = path.toUpperCase().lastIndexOf('PUBLIC');
  if (publicIndex !== -1) {
    path = path.slice(publicIndex + 6).replace(/^\/+/, '') || path;
  }
  return path.startsWith('/') ? path : `/${path}`;
}
