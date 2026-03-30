import { layoutPrepared, prepareText } from './pretext';

export class PretextLayoutManager {
  private cache = new Map<string, ReturnType<typeof prepareText>>();

  private key(text: string, width: number, fontSize: number, lineHeight: number) {
    const bucket = Math.round(width / 24) * 24;
    return `${text}|${bucket}|${fontSize}|${lineHeight}`;
  }

  layout(req: { text: string; width: number; fontSize: number; lineHeight: number; maxLines?: number; }) {
    const k = this.key(req.text, req.width, req.fontSize, req.lineHeight);
    if (!this.cache.has(k)) this.cache.set(k, prepareText(req.text, { fontSize: req.fontSize, lineHeight: req.lineHeight }));
    return layoutPrepared(this.cache.get(k)!, { width: req.width, maxLines: req.maxLines ?? 4 });
  }
}
