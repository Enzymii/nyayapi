import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';

import './global.css';
import GlobalContextProvider from './globalContextProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <GlobalContextProvider>{children}</GlobalContextProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
