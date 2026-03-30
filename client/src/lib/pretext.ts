const CHAR_WIDTH_FACTOR = 0.58;

export function prepareText(text: string, options: { fontSize?: number; lineHeight?: number; } = {}) {
  const fontSize = options.fontSize ?? 14;
  const lineHeight = options.lineHeight ?? Math.round(fontSize * 1.35);
  return { text: text ?? '', fontSize, lineHeight };
}

export function layoutPrepared(prepared: ReturnType<typeof prepareText>, options: { width?: number; maxLines?: number; } = {}) {
  const width = Math.max(40, options.width ?? 240);
  const maxLines = options.maxLines ?? 6;
  const tokens = prepared.text.split(/\s+/).filter(Boolean);
  const charWidth = prepared.fontSize * CHAR_WIDTH_FACTOR;
  const lines: string[] = [];
  let current = '';
  for (const token of tokens) {
    const candidate = current ? `${current} ${token}` : token;
    if (candidate.length * charWidth <= width || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = token;
      if (lines.length >= maxLines) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return { lines, width, lineHeight: prepared.lineHeight, height: lines.length * prepared.lineHeight };
}
