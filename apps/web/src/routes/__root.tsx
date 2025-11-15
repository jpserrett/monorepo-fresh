import { createRootRoute, Outlet, Scripts, HeadContent } from '@tanstack/react-router';
import { AuthProvider } from '../lib/auth';
import appCss from '../styles.css?url';
import type { ReactNode } from 'react';

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-4">Page not found</p>
        <a href="/" className="text-blue-600 hover:underline">
          Go back home
        </a>
      </div>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}