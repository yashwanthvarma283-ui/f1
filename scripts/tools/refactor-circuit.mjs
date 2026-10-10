import fs from 'fs';
let content = fs.readFileSync('src/features/hero/CircuitOutline.tsx', 'utf-8');

// We just replace the map call for turnsData and carPosition to conditionally render
content = content.replace(
  '{info.turnsData.map((turn, idx) => {',
  '{variant === "card" && info.turnsData.map((turn, idx) => {'
);
content = content.replace(
  '{!shouldReduceMotion && carPosition && (',
  '{variant === "card" && !shouldReduceMotion && carPosition && ('
);
content = content.replace(
  '{activeTurn && (',
  '{variant === "card" && activeTurn && ('
);
content = content.replace(
  '{info.lapRecord && (',
  '{variant === "card" && info.lapRecord && ('
);

// We wrap the whole return in a conditional:
// If variant === 'outline-only', return the SVG only. But we don't want to duplicate.
// Actually, let's just use CSS for outline-only wrapper.
// No, the prompt says "remove text/chips".
// Let's just conditionally render the header.
content = content.replace(
  '<div className="w-full flex items-center justify-between text-xs font-mono mb-1.5 z-10">',
  '{variant === "card" && <div className="w-full flex items-center justify-between text-xs font-mono mb-1.5 z-10">'
);
content = content.replace(
  '        </div>\n      </div>\n\n      {/* SVG Canvas */}',
  '        </div>\n      </div>}\n\n      {/* SVG Canvas */}'
);

// If outline-only, don't return the outer div card styling
content = content.replace(
  '<div className="f1-card-accent relative flex flex-col items-center justify-center p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-[var(--card-shadow)] overflow-hidden transition-all duration-200 hover:shadow-[var(--card-shadow-hover)]">',
  '<div className={variant === "card" ? "f1-card-accent relative flex flex-col items-center justify-center p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-[var(--card-shadow)] overflow-hidden transition-all duration-200 hover:shadow-[var(--card-shadow-hover)]" : "relative w-full h-full flex items-center justify-center"}>'
);

fs.writeFileSync('src/features/hero/CircuitOutline.tsx', content);
console.log('Refactored CircuitOutline.tsx');
