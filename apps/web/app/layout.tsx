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
      <head>
        <title key="title">是沫纯喵w~</title>
      </head>
      <body>
        <AppRouterCacheProvider>
          <GlobalContextProvider>{children}</GlobalContextProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
