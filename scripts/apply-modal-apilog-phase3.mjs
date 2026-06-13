import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ui = path.join(__dirname, '../src/components/ui');

const HOOK_RE =
  /  const \{\r?\n    showLogApiToolbar,\r?\n    apiPayloadModalOpen,\r?\n    setApiPayloadModalOpen,\r?\n    pendingApiApply,\r?\n    setPendingApiApply,\r?\n    closePreview,\r?\n    openPreviewReadOnly,\r?\n  \} = useModalApiLog\(\);/;

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
  if (!/^Modal.*\.tsx$/.test(f) || f === 'Modal.tsx' || f === 'ModalCoSo.tsx') continue;
  const p = path.join(ui, f);
  let t = fs.readFileSync(p, 'utf8');
  if (!t.includes('useModalApiLog()') || t.includes('apiSessionLogs')) continue;
  const m = t.match(HOOK_RE);
  if (!m) {
    console.log('NO REGEX', f);
    continue;
  }
  t = t.replace(HOOK_RE, NEW_HOOK + CLEAR_EFFECT);
  fs.writeFileSync(p, t);
  console.log('expanded', f);
}

for (const f of fs.readdirSync(ui)) {
  if (!/^Modal.*\.tsx$/.test(f) || f === 'Modal.tsx') continue;
  const p = path.join(ui, f);
  let t = fs.readFileSync(p, 'utf8');
  if (!t.includes('loggedFetch')) continue;
  const n = t.replace(/\bfetch\(/g, 'loggedFetch(');
  if (n !== t) fs.writeFileSync(p, n);
}

for (const f of fs.readdirSync(ui)) {
  if (!/^Modal.*\.tsx$/.test(f) || f === 'Modal.tsx') continue;
  const p = path.join(ui, f);
  let t = fs.readFileSync(p, 'utf8');
  if (!t.includes('loggedFetch')) continue;
  if (t.includes("ApiSessionLogModal")) continue;
  if (t.includes('ApiPayloadPreviewModal')) {
    t = t.replace(
      /import ApiPayloadPreviewModal from '@\/components\/ui\/ApiPayloadPreviewModal';\r?\n/,
      "import ApiPayloadPreviewModal from '@/components/ui/ApiPayloadPreviewModal';\nimport ApiSessionLogModal from '@/components/ui/ApiSessionLogModal';\n"
    );
    fs.writeFileSync(p, t);
    console.log('import', f);
  }
}
