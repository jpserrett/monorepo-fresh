import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useActionState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@repo/ui';
import { useAuth } from '../lib/auth';
import { rpcClient } from '../lib/rpc-client';

export const Route = createFileRoute('/login')({
  component: Login,
});

type FormState = {
  error?: string;
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  async function loginAction(_prevState: FormState, formData: FormData): Promise<FormState> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const user = await rpcClient.auth.login({ email, password });
      login(user);
      navigate({ to: '/dashboard' });
      return {};
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Invalid credentials' };
    }
  }

  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="admin@demo.com"
                required
                defaultValue=""
              />
              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="admin123"
                required
                defaultValue=""
              />
              {state.error && (
                <p className="text-sm text-red-600">{state.error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:underline">
                Register
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}