import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/es';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Helpers ────────────────────────────────────────────────────────────────

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ── Permission builders ────────────────────────────────────────────────────

function ownerPermissions(): string {
  return JSON.stringify({
    users: { read: true, create: true, update: true, delete: true },
    settings: { read: true, create: true, update: true, delete: true },
    companies: { read: true, create: true, update: true, delete: true },
    customers: { read: true, create: true, update: true, delete: true },
    contacts: { read: true, create: true, update: true, delete: true },
    deals: { read: true, create: true, update: true, delete: true },
    tasks: { read: true, create: true, update: true, delete: true },
    dashboard: { read: true },
  });
}

function adminPermissions(): string {
  return JSON.stringify({
    users: { read: true, create: true, update: true, delete: true },
    settings: { read: true, create: true, update: true, delete: true },
    companies: { read: true, create: true, update: true, delete: true },
    customers: { read: true, create: true, update: true, delete: true },
    contacts: { read: true, create: true, update: true, delete: true },
    deals: { read: true, create: true, update: true, delete: true },
    tasks: { read: true, create: true, update: true, delete: true },
    dashboard: { read: true },
  });
}

function salesPermissions(): string {
  return JSON.stringify({
    users: { read: false, create: false, update: false, delete: false },
    settings: { read: false, create: false, update: false, delete: false },
    companies: { read: true, create: true, update: true, delete: false },
    customers: { read: true, create: true, update: true, delete: false },
    contacts: { read: true, create: true, update: true, delete: false },
    deals: { read: true, create: true, update: true, delete: false },
    tasks: { read: true, create: true, update: true, delete: true },
    dashboard: { read: true },
  });
}

function viewerPermissions(): string {
  return JSON.stringify({
    users: { read: false, create: false, update: false, delete: false },
    settings: { read: false, create: false, update: false, delete: false },
    companies: { read: true, create: false, update: false, delete: false },
    customers: { read: true, create: false, update: false, delete: false },
    contacts: { read: true, create: false, update: false, delete: false },
    deals: { read: true, create: false, update: false, delete: false },
    tasks: { read: true, create: false, update: false, delete: false },
    dashboard: { read: true },
  });
}

const roleDefs = [
  { name: 'OWNER', permissions: ownerPermissions() },
  { name: 'ADMIN', permissions: adminPermissions() },
  { name: 'SALES', permissions: salesPermissions() },
  { name: 'VIEWER', permissions: viewerPermissions() },
];

// ── Faker seed configuration ───────────────────────────────────────────────

faker.seed(123456);

const companyIndustries = [
  'Tecnología', 'Finanzas', 'Salud', 'Educación', 'Comercio',
  'Logística', 'Construcción', 'Alimentos', 'Energía', 'Consultoría',
];

const companySizes = ['1-10', '11-50', '51-200', '201+'] as const;

const DEAL_STAGES = ['NEW', 'CONTACTED', 'MEETING', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;

const LOST_REASONS = ['Presupuesto insuficiente', 'Competidor mejor valorado', 'No hay necesidad', 'Cierre postergado', 'Contacto perdido'];

async function main() {
  console.log('🧹 Limpiando datos existentes...');

  await prisma.activity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.file.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.role.deleteMany();

  // ── a. Roles ───────────────────────────────────────────────────────────

  console.log('Creando Roles...');
  const roles: Record<string, string> = {};
  for (const r of roleDefs) {
    const created = await prisma.role.create({ data: r });
    roles[r.name] = created.id;
  }
  console.log(`  ✓ ${roleDefs.length} roles creados`);

  // ── b. Organization ────────────────────────────────────────────────────

  console.log('Creando Organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'GurkCRM Demo',
      timezone: 'America/Argentina/Buenos_Aires',
    },
  });
  console.log(`  ✓ Organization: ${org.id}`);

  // ── c. Users ───────────────────────────────────────────────────────────

  console.log('Creando Users...');
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  const defaultPassword = await bcrypt.hash('Demo1234', saltRounds);

  const userDefs = [
    { fullName: 'Ana Martínez', email: 'owner@gurkcrm.demo', roleName: 'OWNER' as const },
    { fullName: 'Carlos López', email: 'admin@gurkcrm.demo', roleName: 'ADMIN' as const },
    { fullName: 'Sofía Ramírez', email: 'sales@gurkcrm.demo', roleName: 'SALES' as const },
    { fullName: 'Pedro García', email: 'viewer@gurkcrm.demo', roleName: 'VIEWER' as const },
  ];

  const users: Record<string, string> = {};
  for (const u of userDefs) {
    const created = await prisma.user.create({
      data: {
        organizationId: org.id,
        roleId: roles[u.roleName],
        fullName: u.fullName,
        email: u.email,
        passwordHash: defaultPassword,
        isActive: true,
      },
    });
    users[u.roleName] = created.id;
  }
  console.log(`  ✓ ${userDefs.length} users creados`);

  // ── d. Companies ───────────────────────────────────────────────────────

  console.log('Creando Companies...');
  const companyIds: string[] = [];
  for (let i = 0; i < 10; i++) {
    const created = await prisma.company.create({
      data: {
        organizationId: org.id,
        name: faker.company.name(),
        industry: randomItem(companyIndustries),
        website: faker.internet.url(),
        address: faker.location.streetAddress(),
        size: randomItem(companySizes),
        status: 'ACTIVE',
      },
    });
    companyIds.push(created.id);
  }
  console.log(`  ✓ ${companyIds.length} companies creadas`);

  // ── e. Contacts ────────────────────────────────────────────────────────

  console.log('Creando Contacts...');
  let contactCount = 0;
  const companiesWithContacts = randomPick(companyIds, 7);
  for (const cid of companiesWithContacts) {
    const numContacts = randomInt(1, 4);
    for (let i = 0; i < numContacts; i++) {
      await prisma.contact.create({
        data: {
          companyId: cid,
          fullName: faker.person.fullName(),
          position: faker.person.jobTitle(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          socialLinks: JSON.stringify([
            { platform: 'linkedin', url: faker.internet.url() },
          ]),
        },
      });
      contactCount++;
    }
  }
  console.log(`  ✓ ${contactCount} contacts creados`);

  // ── f. Customers ───────────────────────────────────────────────────────

  console.log('Creando Customers...');
  const customerStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'LEAD', 'LEAD', 'INACTIVE'];
  const salesAndAdminIds = [users['SALES'], users['ADMIN']];
  const customerIds: string[] = [];

  // Pick 5 companies to assign customers to
  const companiesForCustomers = randomPick(companyIds, 5);

  for (let i = 0; i < 30; i++) {
    const assignCompany = i < 15 ? randomItem(companiesForCustomers) : null;

    const created = await prisma.customer.create({
      data: {
        organizationId: org.id,
        companyId: assignCompany,
        ownerId: randomItem(salesAndAdminIds),
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        status: randomItem(customerStatuses),
        notes: Math.random() > 0.5 ? faker.lorem.paragraph() : undefined,
      },
    });
    customerIds.push(created.id);
  }
  console.log(`  ✓ ${customerIds.length} customers creados`);

  // ── g. Deals ───────────────────────────────────────────────────────────

  console.log('Creando Deals...');
  let dealCount = 0;
  const dealsByStage: Record<string, string[]> = {};
  for (const stage of DEAL_STAGES) {
    dealsByStage[stage] = [];
  }

  for (const stage of DEAL_STAGES) {
    const count = stage === 'WON' || stage === 'LOST' ? 6 : 5;
    for (let pos = 0; pos < count; pos++) {
      const customer = await prisma.customer.findFirst({
        where: { organizationId: org.id },
        skip: randomInt(0, customerIds.length - 1),
      });
      if (!customer) continue;

      const created = await prisma.deal.create({
        data: {
          organizationId: org.id,
          customerId: customer.id,
          companyId: customer.companyId,
          ownerId: customer.ownerId,
          title: faker.commerce.productName(),
          estimatedValue: randomInt(500, 50000),
          currency: 'USD',
          stage,
          expectedCloseDate:
            stage !== 'WON' && stage !== 'LOST'
              ? faker.date.future()
              : undefined,
          lostReason: stage === 'LOST' ? randomItem(LOST_REASONS) : undefined,
          position: pos,
        },
      });
      dealsByStage[stage].push(created.id);
      dealCount++;
    }
  }
  console.log(`  ✓ ${dealCount} deals creados`);

  // ── h. Tasks ───────────────────────────────────────────────────────────

  console.log('Creando Tasks...');
  const priorities = ['LOW', 'MEDIUM', 'MEDIUM', 'HIGH'] as const;
  const taskStatuses = ['PENDING', 'IN_PROGRESS', 'DONE'] as const;

  // Collect some deal and customer IDs for linking
  const allDealIds = Object.values(dealsByStage).flat();
  const linkedDealIds = randomPick(allDealIds, 6);
  const linkedCustomerIds = randomPick(customerIds, 5);

  for (let i = 0; i < 25; i++) {
    const assignee = randomItem(salesAndAdminIds);
    const linkDeal = i < 6 ? linkedDealIds[i] : undefined;
    const linkCustomer = i >= 6 && i < 11 ? linkedCustomerIds[i - 6] : undefined;

    await prisma.task.create({
      data: {
        organizationId: org.id,
        assigneeId: assignee,
        relatedCustomerId: linkCustomer ?? undefined,
        relatedDealId: linkDeal ?? undefined,
        title: faker.lorem.sentence({ min: 3, max: 8 }),
        description: Math.random() > 0.3 ? faker.lorem.paragraph() : undefined,
        priority: randomItem(priorities),
        dueDate: Math.random() > 0.3 ? faker.date.soon() : undefined,
        status: randomItem(taskStatuses),
      },
    });
  }
  console.log('  ✓ 25 tasks creadas');

  // ── i. Comments ────────────────────────────────────────────────────────

  console.log('Creando Comments...');
  const commentTargets: { entityType: string; entityId: string }[] = [];

  for (const cid of randomPick(customerIds, 4)) {
    commentTargets.push({ entityType: 'CUSTOMER', entityId: cid });
  }
  for (const did of randomPick(allDealIds, 4)) {
    commentTargets.push({ entityType: 'DEAL', entityId: did });
  }

  const allUserIds = Object.values(users);
  for (const target of commentTargets) {
    const numComments = randomInt(1, 2);
    for (let i = 0; i < numComments; i++) {
      await prisma.comment.create({
        data: {
          authorId: randomItem(allUserIds),
          entityType: target.entityType,
          entityId: target.entityId,
          body: faker.lorem.paragraph(),
        },
      });
    }
  }
  console.log(`  ✓ ${commentTargets.length} targets con comments`);

  // ── j. Notifications ───────────────────────────────────────────────────

  console.log('Creando Notifications...');
  const notifTypes = ['NEW_CUSTOMER', 'TASK_ASSIGNED', 'NEW_COMMENT', 'REMINDER'] as const;
  const notifTitles: Record<string, string> = {
    NEW_CUSTOMER: 'Nuevo cliente asignado',
    TASK_ASSIGNED: 'Nueva tarea asignada',
    NEW_COMMENT: 'Nuevo comentario en una oportunidad',
    REMINDER: 'Recordatorio: seguimiento pendiente',
  };

  for (let i = 0; i < 8; i++) {
    const ntype = randomItem(notifTypes);
    await prisma.notification.create({
      data: {
        userId: randomItem(salesAndAdminIds),
        type: ntype,
        title: notifTitles[ntype],
        body: Math.random() > 0.4 ? faker.lorem.sentence() : undefined,
        isRead: Math.random() > 0.6,
        linkUrl: Math.random() > 0.5 ? '/deals' : undefined,
      },
    });
  }
  console.log('  ✓ 8 notifications creadas');

  // ── Summary ────────────────────────────────────────────────────────────

  const counts = {
    roles: await prisma.role.count(),
    organizations: await prisma.organization.count(),
    users: await prisma.user.count(),
    companies: await prisma.company.count(),
    contacts: await prisma.contact.count(),
    customers: await prisma.customer.count(),
    deals: await prisma.deal.count(),
    tasks: await prisma.task.count(),
    comments: await prisma.comment.count(),
    notifications: await prisma.notification.count(),
  };

  console.log('\n═══════════════════════════════════════');
  console.log('  Resumen de seed');
  console.log('═══════════════════════════════════════');
  for (const [key, value] of Object.entries(counts)) {
    console.log(`  ${key.padEnd(16)} ${value}`);
  }
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
