import { prepareText, layoutPrepared } from '@chenglou/pretext';

export interface LayoutRequest { text: string; width: number; fontSize: number; lineHeight: number; maxLines?: number; }

export class PretextLayoutManager {
  private preparedCache = new Map<string, ReturnType<typeof prepareText>>();

  private key(req: LayoutRequest) {
    const bucket = Math.round(req.width / 24) * 24;
    return `${req.text}|${req.fontSize}|${req.lineHeight}|${bucket}`;
  }

  layout(req: LayoutRequest) {
    const key = this.key(req);
    if (!this.preparedCache.has(key)) {
      this.preparedCache.set(key, prepareText(req.text, { fontSize: req.fontSize, lineHeight: req.lineHeight }));
    }
    const prepared = this.preparedCache.get(key)!;
    return layoutPrepared(prepared, { width: req.width, maxLines: req.maxLines ?? 4 });
  }

  cacheSize() { return this.preparedCache.size; }
}
