import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ui = path.join(__dirname, '../src/components/ui');

const SESSION_BLOCK = `
      <ApiSessionLogModal
        isOpen={sessionLogModalOpen}
        onClose={() => setSessionLogModalOpen(false)}
        contained={contained}
        logs={apiSessionLogs}
      />`;

for (const f of fs.readdirSync(ui)) {
  if (!/^Modal.*\.tsx$/.test(f) || f === 'Modal.tsx') continue;
  const p = path.join(ui, f);
  let t = fs.readFileSync(p, 'utf8');
  if (!t.includes("from '@/components/ui/ApiSessionLogModal'")) continue;
  if (t.includes('<ApiSessionLogModal')) continue;
  if (!t.includes('<ApiPayloadPreviewModal')) continue;
  const re = /(\n\s*<ApiPayloadPreviewModal[\s\S]*?\n\s*\/>)/;
  if (!re.test(t)) {
    console.log('no preview modal', f);
    continue;
  }
  t = t.replace(re, `$1${SESSION_BLOCK}`);
  fs.writeFileSync(p, t);
  console.log('session modal', f);
}
