/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// FlyonUI global augmentation
declare global {
  interface Window {
    HSStaticMethods?: {
      autoInit(): void;
      [key: string]: any;
    };
  }
}
