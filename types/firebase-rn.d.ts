// firebase/auth ships browser types by default. The React Native build
// (resolved by Metro at runtime) also exports getReactNativePersistence,
// but TypeScript can't see it because the exports map puts "types" before
// the "react-native" condition. This augmentation bridges the gap.
export {};

type Persistence = import('firebase/auth').Persistence;

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  }): Persistence;
}
