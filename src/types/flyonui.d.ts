// src/types/flyonui.d.ts
import type { IStaticMethods } from "flyonui/flyonui";

declare global {
  interface Window {
    // Optional third-party libraries
    _;
    $: typeof import("jquery");
    jQuery: typeof import("jquery");
    DataTable;
    Dropzone;

    // FlyonUI
    HSStaticMethods: IStaticMethods;
    HSAccordion: typeof HSAccordion;
  }
}

// Export เพื่อให้ไฟล์นี้เป็น module declaration (สำคัญ!)
export {};
