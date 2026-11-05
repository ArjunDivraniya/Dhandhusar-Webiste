import { prisma } from '../config/prisma.js';
import { hashPassword } from '../utils/password.js';
import { env } from '../config/env.js';
import crypto from 'crypto';

interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
}

// 1. Approved Roles and their permission matrix
const PERMISSIONS = [
  { code: 'dashboard.view', description: 'View private administrative dashboard' },
  { code: 'news.create', description: 'Draft news articles and announcements' },
  { code: 'news.edit', description: 'Edit existing news drafts' },
  { code: 'news.submit_review', description: 'Submit news articles for publisher review' },
  { code: 'news.review', description: 'Review and approve/reject submitted news' },
  { code: 'news.publish', description: 'Publish approved news live to the portal' },
  { code: 'news.archive', description: 'Archive obsolete or deprecated news articles' },
  { code: 'places.manage', description: 'Manage temples, historical sites, and village landmarks' },
  { code: 'village_info.manage', description: 'Manage agriculture, dairy, and heritage content' },
  { code: 'businesses.manage', description: 'Manage local commercial directory listings' },
  { code: 'events.manage', description: 'Manage village calendar events and celebrations' },
  { code: 'gallery.manage', description: 'Upload and organize Cloudinary multimedia assets' },
  { code: 'users.manage', description: 'Manage administrator accounts' },
  { code: 'roles.manage', description: 'Configure roles and assign capabilities' },
  { code: 'audit.view', description: 'Inspect system activity logs and audit trail' },
];

const ROLES: RoleDefinition[] = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full administrative access and system authority',
    permissions: PERMISSIONS.map((p) => p.code),
  },
  {
    name: 'PUBLISHER',
    description: 'Editorial oversight with publishing and review authority',
    permissions: [
      'dashboard.view',
      'news.review',
      'news.publish',
      'news.archive',
      'places.manage',
      'village_info.manage',
      'businesses.manage',
      'events.manage',
      'gallery.manage',
      'audit.view',
    ],
  },
  {
    name: 'CONTENT_EDITOR',
    description: 'Content creator capable of authoring drafts and submitting for review',
    permissions: [
      'dashboard.view',
      'news.create',
      'news.edit',
      'news.submit_review',
      'places.manage',
      'village_info.manage',
      'businesses.manage',
      'events.manage',
    ],
  },
  {
    name: 'GALLERY_MANAGER',
    description: 'Curates photo albums, documentary videos, and village visual media',
    permissions: ['dashboard.view', 'gallery.manage'],
  },
];

export async function seedRolesAndPermissions(): Promise<void> {
  console.log('🌱 Seeding RBAC permissions and approved roles...');

  // 1. Upsert Permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      create: { code: perm.code, description: perm.description },
      update: { description: perm.description },
    });
  }
  console.log(`✅ Upserted ${PERMISSIONS.length} system permissions.`);

  // 2. Upsert Roles and link Permissions
  for (const roleDef of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      create: { name: roleDef.name, description: roleDef.description },
      update: { description: roleDef.description },
    });

    for (const permCode of roleDef.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { code: permCode },
      });
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
          update: {},
        });
      }
    }
  }
  console.log(`✅ Upserted ${ROLES.length} approved roles with permission bindings.`);
}

export async function provisionSuperAdmin(): Promise<void> {
  const email = (env.SUPER_ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || 'admin@dhandusar.gujarat.gov.in').toLowerCase().trim();
  const name = env.SUPER_ADMIN_NAME || process.env.SUPER_ADMIN_NAME || 'Chief Administrator';

  // Check if admin already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });

  if (existingUser) {
    const isSuperAdmin = existingUser.roles.some((r) => r.role.name === 'SUPER_ADMIN');
    if (isSuperAdmin) {
      console.log(`ℹ️ Super Admin account with email '${email}' already exists. No action needed.`);
      return;
    }
  }

  // Determine password
  let password = env.SUPER_ADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD;
  let generatedPassword = false;

  if (!password) {
    password = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, 'A') + '!9a';
    generatedPassword = true;
  }

  const passwordHash = await hashPassword(password);

  // Create or update user
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
      isActive: true,
    },
    update: {
      passwordHash,
      isActive: true,
    },
  });

  // Assign SUPER_ADMIN role
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'SUPER_ADMIN' },
  });

  if (!superAdminRole) {
    throw new Error('SUPER_ADMIN role not found. Ensure seedRolesAndPermissions runs first.');
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: superAdminRole.id,
      },
    },
    create: {
      userId: user.id,
      roleId: superAdminRole.id,
    },
    update: {},
  });

  // Audit log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'BOOTSTRAP_SUPER_ADMIN_PROVISIONED',
      entityType: 'User',
      entityId: user.id,
      metadata: { email, name },
    },
  });

  console.log('========================================================');
  console.log('🎉 Super Admin account provisioned successfully!');
  console.log(`📧 Email: ${email}`);
  console.log(`👤 Name:  ${name}`);
  if (generatedPassword) {
    console.log(`🔑 Generated Password: ${password}`);
    console.log('⚠️  Store this password immediately! It will not be shown again.');
  } else {
    console.log('🔑 Password: [CONFIGURED VIA SUPER_ADMIN_PASSWORD ENV]');
  }
  console.log('========================================================');
}

async function main() {
  try {
    await seedRolesAndPermissions();
    await provisionSuperAdmin();
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Failed to provision Super Admin:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('seedAdmin.ts') || process.argv[1]?.endsWith('seedAdmin.js')) {
  main();
}

