import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ui = path.join(__dirname, '../src/components/ui');

const OLD_HOOK = `  const {
    showLogApiToolbar,
    apiPayloadModalOpen,
    setApiPayloadModalOpen,
    pendingApiApply,
    setPendingApiApply,
    closePreview,
    openPreviewReadOnly,
  } = useModalApiLog();`;

const NEW_HOOK = `  const {
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

const CLEAR_EFFECT = `
  useEffect(() => {
    if (isOpen) clearSessionLogs();
  }, [isOpen, clearSessionLogs]);
`;

for (const f of fs.readdirSync(ui)) {
  if (!/^Modal.*\.tsx$/.test(f) || f === 'Modal.tsx') continue;
  const p = path.join(ui, f);
  let t = fs.readFileSync(p, 'utf8');
  if (!t.includes('useModalApiLog()')) continue;
  if (t.includes('apiSessionLogs')) {
    console.log('skip expand', f);
  } else if (t.includes(OLD_HOOK)) {
    t = t.replace(OLD_HOOK, NEW_HOOK + CLEAR_EFFECT);
    fs.writeFileSync(p, t);
    console.log('expanded', f);
  } else {
    console.log('NO MATCH', f);
  }
}

for (const f of fs.readdirSync(ui)) {
  if (!/^Modal.*\.tsx$/.test(f) || f === 'Modal.tsx') continue;
  const p = path.join(ui, f);
  let t = fs.readFileSync(p, 'utf8');
  if (!t.includes('loggedFetch')) continue;
  const n = t.replace(/\bfetch\(/g, 'loggedFetch(');
  if (n !== t) {
    fs.writeFileSync(p, n);
    console.log('fetch->loggedFetch', f);
  }
}

for (const f of fs.readdirSync(ui)) {
  if (!/^Modal.*\.tsx$/.test(f) || f === 'Modal.tsx') continue;
  const p = path.join(ui, f);
  let t = fs.readFileSync(p, 'utf8');
  if (!t.includes('loggedFetch')) continue;
  if (t.includes("from '@/components/ui/ApiSessionLogModal'")) continue;
  if (!t.includes("from '@/components/ui/ApiPayloadPreviewModal'")) continue;
  t = t.replace(
    /import ApiPayloadPreviewModal from '@\/components\/ui\/ApiPayloadPreviewModal';\n/,
    "import ApiPayloadPreviewModal from '@/components/ui/ApiPayloadPreviewModal';\nimport ApiSessionLogModal from '@/components/ui/ApiSessionLogModal';\n"
  );
  fs.writeFileSync(p, t);
  console.log('import ApiSessionLogModal', f);
}
