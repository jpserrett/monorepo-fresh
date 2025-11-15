import { db, users, todos } from './index';
import { hashPassword } from './utils';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.delete(todos);
    await db.delete(users);

    // Create users
    console.log('👥 Creating users...');
    const [admin, regularUser, alice, bob, charlie, diana, eve] = await db.insert(users).values([
      {
        email: 'admin@demo.com',
        name: 'Admin User',
        password: await hashPassword('admin123'),
        role: 'admin',
      },
      {
        email: 'user@demo.com',
        name: 'Regular User',
        password: await hashPassword('user123'),
        role: 'user',
      },
      {
        email: 'alice@demo.com',
        name: 'Alice Designer',
        password: await hashPassword('demo123'),
        role: 'user',
      },
      {
        email: 'bob@demo.com',
        name: 'Bob Engineer',
        password: await hashPassword('demo123'),
        role: 'user',
      },
      {
        email: 'charlie@demo.com',
        name: 'Charlie Manager',
        password: await hashPassword('demo123'),
        role: 'user',
      },
      {
        email: 'diana@demo.com',
        name: 'Diana Product',
        password: await hashPassword('demo123'),
        role: 'user',
      },
      {
        email: 'eve@demo.com',
        name: 'Eve Marketing',
        password: await hashPassword('demo123'),
        role: 'user',
      },
    ]).returning();

    console.log(`✅ Created ${7} users`);

    // Create todos for regular user
    console.log('📋 Creating todos...');
    await db.insert(todos).values([
      // Regular User todos
      {
        userId: regularUser.id,
        title: 'Complete project proposal',
        description: 'Write and submit Q4 project proposal',
        priority: 'high',
        completed: false,
        dueDate: new Date('2025-11-15'),
      },
      {
        userId: regularUser.id,
        title: 'Review pull requests',
        description: 'Review pending PRs from team',
        priority: 'medium',
        completed: false,
      },
      {
        userId: regularUser.id,
        title: 'Update documentation',
        description: 'Update API docs with new endpoints',
        priority: 'low',
        completed: true,
      },
      {
        userId: regularUser.id,
        title: 'Team meeting prep',
        description: 'Prepare slides for weekly sync',
        priority: 'medium',
        completed: false,
        dueDate: new Date('2025-11-12'),
      },
      {
        userId: regularUser.id,
        title: 'Code review',
        description: 'Review authentication module',
        priority: 'high',
        completed: true,
      },
      {
        userId: regularUser.id,
        title: 'Database optimization',
        description: 'Optimize slow queries',
        priority: 'medium',
        completed: false,
      },
      {
        userId: regularUser.id,
        title: 'Write unit tests',
        description: 'Add tests for new features',
        priority: 'high',
        completed: false,
        dueDate: new Date('2025-11-20'),
      },
      {
        userId: regularUser.id,
        title: 'Update dependencies',
        description: 'Update npm packages',
        priority: 'low',
        completed: true,
      },

      // Alice's todos
      {
        userId: alice.id,
        title: 'Design new landing page',
        description: 'Create mockups for homepage redesign',
        priority: 'high',
        completed: false,
        dueDate: new Date('2025-11-18'),
      },
      {
        userId: alice.id,
        title: 'User research synthesis',
        description: 'Compile findings from user interviews',
        priority: 'medium',
        completed: false,
      },
      {
        userId: alice.id,
        title: 'Update design system',
        description: 'Add new component variants',
        priority: 'low',
        completed: true,
      },
      {
        userId: alice.id,
        title: 'Create icons',
        description: 'Design icons for new features',
        priority: 'medium',
        completed: false,
      },
      {
        userId: alice.id,
        title: 'Prototype dashboard',
        description: 'Build interactive prototype',
        priority: 'high',
        completed: false,
        dueDate: new Date('2025-11-22'),
      },
      {
        userId: alice.id,
        title: 'Accessibility audit',
        description: 'Review designs for WCAG compliance',
        priority: 'medium',
        completed: true,
      },

      // Bob's todos
      {
        userId: bob.id,
        title: 'Implement authentication',
        description: 'Add OAuth2 support',
        priority: 'high',
        completed: false,
        dueDate: new Date('2025-11-25'),
      },
      {
        userId: bob.id,
        title: 'Fix production bug',
        description: 'Investigate memory leak',
        priority: 'high',
        completed: true,
      },
      {
        userId: bob.id,
        title: 'Deploy to staging',
        description: 'Push latest changes to staging env',
        priority: 'medium',
        completed: false,
      },
      {
        userId: bob.id,
        title: 'Performance optimization',
        description: 'Reduce bundle size',
        priority: 'medium',
        completed: false,
      },

      // Charlie's todos
      {
        userId: charlie.id,
        title: 'Sprint planning',
        description: 'Plan next sprint with team',
        priority: 'high',
        completed: false,
        dueDate: new Date('2025-11-11'),
      },
      {
        userId: charlie.id,
        title: 'Update roadmap',
        description: 'Review and update Q4 roadmap',
        priority: 'medium',
        completed: false,
      },
      {
        userId: charlie.id,
        title: 'Stakeholder meeting',
        description: 'Present progress to stakeholders',
        priority: 'high',
        completed: true,
      },

      // Diana's todos
      {
        userId: diana.id,
        title: 'Feature spec review',
        description: 'Review specs for new feature',
        priority: 'high',
        completed: false,
      },
      {
        userId: diana.id,
        title: 'Customer feedback analysis',
        description: 'Analyze recent customer feedback',
        priority: 'medium',
        completed: false,
        dueDate: new Date('2025-11-16'),
      },
      {
        userId: diana.id,
        title: 'Prioritize backlog',
        description: 'Rank backlog items by value',
        priority: 'medium',
        completed: true,
      },

      // Eve's todos
      {
        userId: eve.id,
        title: 'Launch campaign',
        description: 'Launch Q4 marketing campaign',
        priority: 'high',
        completed: false,
        dueDate: new Date('2025-11-14'),
      },
      {
        userId: eve.id,
        title: 'Social media posts',
        description: 'Schedule posts for next week',
        priority: 'low',
        completed: true,
      },
      {
        userId: eve.id,
        title: 'Analytics report',
        description: 'Create monthly analytics report',
        priority: 'medium',
        completed: false,
      },

      // Admin's oversight todos
      {
        userId: admin.id,
        title: 'System maintenance',
        description: 'Perform routine system checks',
        priority: 'high',
        completed: false,
        dueDate: new Date('2025-11-13'),
      },
      {
        userId: admin.id,
        title: 'Security audit',
        description: 'Review security logs',
        priority: 'high',
        completed: true,
      },
      {
        userId: admin.id,
        title: 'User management',
        description: 'Review new user requests',
        priority: 'medium',
        completed: false,
      },
    ]);

    console.log(`✅ Created ${30} todos`);
    console.log('✨ Seeding complete!');
    console.log('\n📝 Demo accounts:');
    console.log('   Admin: admin@demo.com / admin123');
    console.log('   User:  user@demo.com / user123');
    console.log('   More:  alice@demo.com, bob@demo.com, etc. / demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();