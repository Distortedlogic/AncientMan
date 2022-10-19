import { Game } from "phaser";

declare global {
  interface Window {
    phaserGame: Game;
  }
  namespace NodeJS {
    interface ProcessEnv {
      // server itself
      NEXT_PUBLIC_ENV: "local" | "development" | "staging" | "production"; // is prod only when deployed to prod
      NODE_ENV: "development" | "production"; // is prod anytime app is built

      NEXT_PUBLIC_PORT: string;
    }
  }
}

export {};
