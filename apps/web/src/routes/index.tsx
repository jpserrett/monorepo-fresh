import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@repo/ui';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Todo App
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A modern full-stack monorepo demo with TanStack Start, oRPC, and Drizzle ORM
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Demo Accounts</h2>
          <div className="space-y-4 text-left">
            <div className="border-b pb-4">
              <p className="font-medium text-gray-900">Admin Account:</p>
              <p className="text-gray-600">Email: admin@demo.com</p>
              <p className="text-gray-600">Password: admin123</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">User Account:</p>
              <p className="text-gray-600">Email: user@demo.com</p>
              <p className="text-gray-600">Password: user123</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="secondary">Register</Button>
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>Built with TypeScript, React 19, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}