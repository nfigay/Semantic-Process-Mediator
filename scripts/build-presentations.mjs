import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const presentations = path.join(root, 'presentations');
const deckName = 'business-object-repository-demo';
const deck = path.join(presentations, deckName);
const dist = path.join(presentations, 'dist');
const reveal = path.join(deck, 'node_modules', 'reveal.js');
const standaloneDist = path.join(root, 'dist', 'standalone');
const viewerStandalone = path.join(standaloneDist, 'coc-bpmn-viewer.html');
const editorStandalone = path.join(standaloneDist, 'coc-bpmn-editor.html');

for (const p of [path.join(reveal, 'dist', 'reveal.js'), path.join(reveal, 'dist', 'reveal.css'), path.join(reveal, 'plugin', 'notes', 'notes.js')]) {
  if (!fs.existsSync(p)) throw new Error(`Missing ${p}. Run npm install in presentations/${deckName} first.`);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const sourceHtml = fs.readFileSync(path.join(deck, 'index.html'), 'utf8');
const localHtml = sourceHtml
  .replace('https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reset.css', './vendor/reveal.js/dist/reset.css')
  .replace('https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.css', './vendor/reveal.js/dist/reveal.css')
  .replace('https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/theme/white.css', './vendor/reveal.js/dist/theme/white.css')
  .replace('https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.js', './vendor/reveal.js/dist/reveal.js')
  .replace('https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/notes/notes.js', './vendor/reveal.js/plugin/notes/notes.js');

const offline = path.join(dist, deckName);
fs.mkdirSync(path.join(offline, 'vendor', 'reveal.js', 'dist', 'theme'), { recursive: true });
fs.mkdirSync(path.join(offline, 'vendor', 'reveal.js', 'plugin', 'notes'), { recursive: true });
fs.writeFileSync(path.join(offline, 'index.html'), localHtml);
for (const f of ['presentation.css', 'SCRIPT.md', 'README.md']) fs.copyFileSync(path.join(deck, f), path.join(offline, f));
for (const [src, dest] of [
  ['dist/reset.css','dist/reset.css'], ['dist/reveal.css','dist/reveal.css'], ['dist/theme/white.css','dist/theme/white.css'],
  ['dist/reveal.js','dist/reveal.js'], ['plugin/notes/notes.js','plugin/notes/notes.js']
]) fs.copyFileSync(path.join(reveal, src), path.join(offline, 'vendor', 'reveal.js', dest));

const css = [
  fs.readFileSync(path.join(reveal, 'dist', 'reset.css'), 'utf8'),
  fs.readFileSync(path.join(reveal, 'dist', 'reveal.css'), 'utf8'),
  fs.readFileSync(path.join(reveal, 'dist', 'theme', 'white.css'), 'utf8'),
  fs.readFileSync(path.join(deck, 'presentation.css'), 'utf8')
].join('\n');
const js = fs.readFileSync(path.join(reveal, 'dist', 'reveal.js'), 'utf8');
const notes = fs.readFileSync(path.join(reveal, 'plugin', 'notes', 'notes.js'), 'utf8');
let standalone = sourceHtml
  .replace(/\s*<link rel="stylesheet" href="https:\/\/cdn\.jsdelivr\.net\/npm\/reveal\.js@5\.2\.1\/dist\/reset\.css">/, '')
  .replace(/\s*<link rel="stylesheet" href="https:\/\/cdn\.jsdelivr\.net\/npm\/reveal\.js@5\.2\.1\/dist\/reveal\.css">/, '')
  .replace(/\s*<link rel="stylesheet" href="https:\/\/cdn\.jsdelivr\.net\/npm\/reveal\.js@5\.2\.1\/dist\/theme\/white\.css">/, '')
  .replace(/\s*<link rel="stylesheet" href="\.\/presentation\.css">/, `\n<style>${css}</style>`)
  .replace('<script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.js"></script>', `<script>${js}</script>`)
  .replace('<script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/notes/notes.js"></script>', `<script>${notes}</script>`);
fs.writeFileSync(path.join(dist, 'BPMNSM-business-object-repository-demo.html'), standalone);

execFileSync('zip', ['-qr', path.join(dist, 'BPMNSM-business-object-repository-demo-package.zip'), deckName], { cwd: dist });

for (const p of [viewerStandalone, editorStandalone]) {
  if (!fs.existsSync(p)) {
    throw new Error(`Missing ${p}. Run the complete npm run build so viewer and editor standalone artifacts exist before packaging.`);
  }
}

const offlinePackageName = 'BPMNSM-offline-package';
const offlinePackage = path.join(dist, offlinePackageName);
fs.mkdirSync(offlinePackage, { recursive: true });

fs.copyFileSync(viewerStandalone, path.join(offlinePackage, 'coc-bpmn-viewer.html'));
fs.copyFileSync(editorStandalone, path.join(offlinePackage, 'coc-bpmn-editor.html'));
fs.cpSync(offline, path.join(offlinePackage, deckName), { recursive: true });

execFileSync(
  'zip',
  ['-qr', path.join(dist, 'BPMNSM-offline-package.zip'), offlinePackageName],
  { cwd: dist }
);

console.log('Built presentation artifacts and BPMNSM offline package in presentations/dist');
