import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/components/ui');

const oldBlock = `  const {
    showLogApiToolbar,
    apiPayloadModalOpen,
    setApiPayloadModalOpen,
    pendingApiApply,
    setPendingApiApply,
    closePreview,
    openPreviewReadOnly,
  } = useModalApiLog();`;

const newBlock = `  const {
    showLogApiToolbar,
    apiPayloadModalOpen,
    setApiPayloadModalOpen,
    pendingApiApply,
    setPendingApiApply,
    closePreview,
    openPreviewReadOnly,
    apiSessionLogs,
    clearSessionLogs,
    loggedFetch,
    sessionLogModalOpen,
    setSessionLogModalOpen,
  } = useModalApiLog();`;

const insEffect = `
  useEffect(() => {
    if (isOpen) clearSessionLogs();
  }, [isOpen, clearSessionLogs]);
`;

for (const f of fs.readdirSync(dir)) {
  if (!/^Modal.*\.tsx$/.test(f) || f === 'Modal.tsx') continue;
  const p = path.join(dir, f);
  let t = fs.readFileSync(p, 'utf8');
  if (!t.includes('useModalApiLog()')) continue;
  if (!t.includes(oldBlock)) {
    console.log('skip (no old block)', f);
    continue;
  }
  let t2 = t.replace(oldBlock, newBlock);
  if (!t2.includes('if (isOpen) clearSessionLogs')) {
    t2 = t2.replace(newBlock, newBlock + insEffect);
  }
  fs.writeFileSync(p, t2);
  console.log('patched', f);
}
