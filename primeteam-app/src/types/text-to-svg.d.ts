declare module "text-to-svg" {
  type Anchor = "left" | "center" | "right";

  type TextToSvgOptions = {
    x?: number;
    y?: number;
    fontSize?: number;
    anchor?: Anchor;
    attributes?: Record<string, string>;
  };

  type TextMetrics = {
    x: number;
    y: number;
    baseline: number;
    width: number;
    height: number;
    ascender: number;
    descender: number;
  };

  class TextToSVG {
    static loadSync(file: string): TextToSVG;

    getPath(text: string, options?: TextToSvgOptions): string;

    getMetrics(text: string, options?: TextToSvgOptions): TextMetrics;
  }

  export default TextToSVG;
}