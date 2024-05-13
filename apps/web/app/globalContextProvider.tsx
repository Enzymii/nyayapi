'use client';

import { UserContextProvider } from '../context/context';

export default function GlobalContextProvider({ children }) {
  return <UserContextProvider>{children}</UserContextProvider>;
}
