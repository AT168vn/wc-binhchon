import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ui = path.join(__dirname, '../src/components/ui');

const LOG_BTN_14 = `                  <button
                    type="button"
                    onClick={() => setSessionLogModalOpen(true)}
                    className="px-3 py-2 text-xs rounded-md border border-dashed border-slate-500 text-slate-800 bg-slate-100 hover:bg-slate-200"
                    title="Log các lần gọi API trong phiên modal (GET/POST/…)"
                  >
                    LogAPI
                  </button>
`;

const LOG_BTN_16 = `                <button
                    type="button"
                    onClick={() => setSessionLogModalOpen(true)}
                    className="px-3 py-2 text-xs rounded-md border border-dashed border-slate-500 text-slate-800 bg-slate-100 hover:bg-slate-200"
                    title="Log các lần gọi API trong phiên modal (GET/POST/…)"
                  >
                    LogAPI
                  </button>
`;

const PAIRS = [
  [
    `              {editorMode === 'locked' ? (
                <>
                  <button
                    type="button"
                    onClick={handleSua}`,
    `              {editorMode === 'locked' ? (
                <>
${LOG_BTN_14}                  <button
                    type="button"
                    onClick={handleSua}`,
  ],
  [
    `            {editorMode === 'locked' ? (
              <>
                <button
                  type="button"
                  onClick={handleSua}`,
    `            {editorMode === 'locked' ? (
              <>
${LOG_BTN_16}                <button
                  type="button"
                  onClick={handleSua}`,
  ],
  [
    `            {editorMode === 'locked' ? (
              <>
                {!TAM_AN_NUT_SUA_LOAI_PHIEU && (
                  <button
                    type="button"
                    onClick={handleSua}`,
    `            {editorMode === 'locked' ? (
              <>
${LOG_BTN_16}                {!TAM_AN_NUT_SUA_LOAI_PHIEU && (
                  <button
                    type="button"
                    onClick={handleSua}`,
  ],
];

for (const f of fs.readdirSync(ui)) {
  if (!/^Modal.*\.tsx$/.test(f) || f === 'Modal.tsx') continue;
  const p = path.join(ui, f);
  let t = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  if (!t.includes('setSessionLogModalOpen')) continue;
  if (t.includes('onClick={() => setSessionLogModalOpen(true)}')) continue;
  let n = t;
  for (const [oldS, newS] of PAIRS) {
    if (n.includes(oldS)) {
      n = n.replace(oldS, newS);
      break;
    }
  }
  if (n === t) console.log('NO MATCH', f);
  else {
    fs.writeFileSync(p, n);
    console.log('ok', f);
  }
}
