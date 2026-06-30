/// <reference types="vite/client" />
declare module "*.jsx";
declare module 'react-dom/client';
declare module 'react';
interface Window {
  fbAsyncInit?: () => void;
  FB?: any;
  __APP_CONFIG__?: {
    backendUrl: string;
    facebookAppId: string;
    googleClientId: string;
  };
}