import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router';
import { Button, Card, CardContent, Badge } from '@repo/ui';
import { rpcClient } from '../lib/rpc-client';
import { useAuth } from '../lib/auth';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    // Simple auth check - in real apps, use more secure methods
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        }
      })
    }
    // Return the user so loader can access it
    return { user: JSON.parse(storedUser) };
  },
  loader: async ({ context }) => {
    // Get user from localStorage for the userIDs
    const storedUser = localStorage.getItem('user');
    const todos = await rpcClient.todos.getTodos({ userId: context.user.id });
    return { todos };
  },
  component: Dashboard,
});

type ActionState = {
  error?: string;
}

function Dashboard() {
  const { todos } = Route.useLoaderData();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false)

  const priorityColors: Record<string, 'danger' | 'warning' | 'default'> = {
    high: 'danger',
    medium: 'warning',
    low: 'default',
  };

  // Toggle todo completion
  async function toggleAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
    const todoId = formData.get('id') as string;
    try {
      await rpcClient.todos.toggleTodo({ id: todoId, userId: user.id})
      router.invalidate();
      return {};
    } catch (err) {
      return { error: err instanceof Error ? err.message: 'Failed to toggle todo' };
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Todo Dashboard</h1>
            <div className="flex gap-4">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  logout();
                  navigate({ to: '/login' });
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Todos</h2>
          <Button>Add Todo</Button>
        </div>

        <div className="space-y-4">
          {todos.map((todo) => (
            <Card key={todo.id}>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    className="w-5 h-5 rounded border-gray-300"
                    readOnly
                  />
                  <div>
                    <p className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                      {todo.title}
                    </p>
                  </div>
                </div>
                <Badge variant={priorityColors[todo.priority]}>
                  {todo.priority}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}