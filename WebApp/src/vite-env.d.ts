/// <reference types="vite/client" />
declare module "*.jsx";
interface Window {
  fbAsyncInit?: () => void;
  FB?: any;
  __APP_CONFIG__?: {
    backendUrl: string;
    facebookAppId: string;
    googleClientId: string;
  };
}