const fs = require('fs');
let code = fs.readFileSync('vl-app/src/components/dashboard/SectionEditorModal.jsx', 'utf8');

// 1. Add import
code = code.replace(/import CloudinaryUploader from '.\/CloudinaryUploader';/, "import CloudinaryUploader from './CloudinaryUploader';\nimport ConfirmModal from './ConfirmModal';");

// 2. Add state
code = code.replace(/const \[successMsg,  setSuccessMsg\]  = useState\(''\);/, "const [successMsg,  setSuccessMsg]  = useState('');\n  const [confirmConfig, setConfirmConfig] = useState(null);");

// 3. Update RepeatableList definition
code = code.replace(/function RepeatableList\(\{ label, items = \[\], onChange, fields \}\) \{/, "function RepeatableList({ label, items = [], onChange, fields, onConfirmRequest }) {");
code = code.replace(/  const remove = \(i\) => \{\n    if \(window.confirm\('Are you sure you want to remove this item\?'\)\) \{\n      onChange\(stableItems.filter\(\(_, idx\) => idx !== i\)\);\n    \}\n  \};/, "  const remove = (i) => {\n    if (onConfirmRequest) {\n      onConfirmRequest({ title: 'Remove Item', message: 'Are you sure you want to remove this item?', onConfirm: () => onChange(stableItems.filter((_, idx) => idx !== i)) });\n    } else if (window.confirm('Are you sure you want to remove this item?')) {\n      onChange(stableItems.filter((_, idx) => idx !== i));\n    }\n  };");

// 4. Update RepeatableList usages to pass onConfirmRequest
code = code.replace(/fields=\{REPEATABLE_CONFIGS\.([^}]+)\.fields\}/g, "fields={REPEATABLE_CONFIGS.$1.fields}\n                onConfirmRequest={setConfirmConfig}");

// 5. Replace inline window.confirm calls in SectionEditorModal
code = code.replace(/if \(window\.confirm\('Are you sure you want to remove this question\?'\)\) \{([\s\S]*?)\}/g, "setConfirmConfig({ title: 'Remove Question', message: 'Are you sure you want to remove this question?', onConfirm: () => {$1} })");

code = code.replace(/if \(window\.confirm\('Are you sure you want to delete all ([^']+)\? This cannot be undone\.'\)\) \{([\s\S]*?)\}/g, "setConfirmConfig({ title: 'Delete All $1', message: 'Are you sure you want to delete all $1? This cannot be undone.', onConfirm: () => {$2} })");

code = code.replace(/if \(window\.confirm\('Are you sure you want to delete all ([^']+)\?'\)\) \{([\s\S]*?)\}/g, "setConfirmConfig({ title: 'Delete All $1', message: 'Are you sure you want to delete all $1?', onConfirm: () => {$2} })");

// 6. Render ConfirmModal at the end
code = code.replace(/(<\/\s*div>\s*)$/, "      <ConfirmModal isOpen={!!confirmConfig} {...(confirmConfig || {})} onClose={() => setConfirmConfig(null)} />\n    $1");

fs.writeFileSync('vl-app/src/components/dashboard/SectionEditorModal.jsx', code);
