declare module "html2canvas";

declare module "jspdf" {
  export class jsPDF {
    constructor(options?: any);
    addPage(format?: any, orientation?: any): void;
    addImage(imageData: any, format: any, x: number, y: number, width: number, height: number, alias?: any, compression?: any, rotation?: any): void;
    save(filename: string): void;
  }
}
