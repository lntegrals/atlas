const CHAR_WIDTH_FACTOR = 0.58;

export function prepareText(text, options = {}) {
  const fontSize = options.fontSize ?? 14;
  const lineHeight = options.lineHeight ?? Math.round(fontSize * 1.35);
  return { text: text ?? '', fontSize, lineHeight, fontFamily: options.fontFamily ?? 'Inter, system-ui, sans-serif' };
}

export function layoutPrepared(prepared, options = {}) {
  const width = Math.max(40, options.width ?? 240);
  const maxLines = options.maxLines ?? 6;
  const tokens = String(prepared.text).split(/\s+/).filter(Boolean);
  const charWidth = prepared.fontSize * CHAR_WIDTH_FACTOR;
  const lines = [];
  let current = '';
  for (const t of tokens) {
    const candidate = current ? `${current} ${t}` : t;
    if (candidate.length * charWidth <= width || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = t;
      if (lines.length >= maxLines) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  const truncated = tokens.length > 0 && lines.join(' ').split(/\s+/).length < tokens.length;
  if (truncated && lines.length > 0) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/[.,;:]?$/, '…');
  }
  return {
    lines,
    width,
    height: lines.length * prepared.lineHeight,
    lineHeight: prepared.lineHeight,
    truncated
  };
}
