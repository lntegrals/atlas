declare module '@chenglou/pretext' {
  export interface PrepareOptions {
    fontSize: number;
    lineHeight: number;
  }

  export interface LayoutOptions {
    width: number;
    maxLines: number;
  }

  export interface PreparedText {
    readonly text: string;
  }

  export interface PreparedLayout {
    lines: string[];
    lineHeight: number;
  }

  export function prepareText(text: string, options: PrepareOptions): PreparedText;
  export function layoutPrepared(preparedText: PreparedText, options: LayoutOptions): PreparedLayout;
}
