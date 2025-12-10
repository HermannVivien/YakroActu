const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Créer un utilisateur admin
  const hashedPassword = await bcrypt.hash('YakroAdmin@2025!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@yakroactu.com' },
    update: {},
    create: {
      email: 'admin@yakroactu.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'YakroActu',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Admin créé:', admin.email);

  // 2. Créer un journaliste
  const journalist = await prisma.user.upsert({
    where: { email: 'journalist@yakroactu.com' },
    update: {},
    create: {
      email: 'journalist@yakroactu.com',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Journaliste',
      role: 'JOURNALIST',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Journaliste créé:', journalist.email);

  // 3. Créer des catégories
  const categories = [
    { name: 'Politique', slug: 'politique', icon: '🏛️', color: '#3B82F6' },
    { name: 'Économie', slug: 'economie', icon: '💼', color: '#10B981' },
    { name: 'Sport', slug: 'sport', icon: '⚽', color: '#F59E0B' },
    { name: 'Culture', slug: 'culture', icon: '🎭', color: '#8B5CF6' },
    { name: 'Santé', slug: 'sante', icon: '🏥', color: '#EF4444' },
    { name: 'Technologie', slug: 'technologie', icon: '💻', color: '#6366F1' }
  ];

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
    console.log('✅ Catégorie créée:', category.name);
  }

  // 4. Créer des tags
  const tags = [
    { name: 'Actualité', slug: 'actualite' },
    { name: 'Côte d\'Ivoire', slug: 'cote-ivoire' },
    { name: 'Abidjan', slug: 'abidjan' },
    { name: 'International', slug: 'international' },
    { name: 'Breaking News', slug: 'breaking-news' }
  ];

  for (const tag of tags) {
    const createdTag = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag
    });
    console.log('✅ Tag créé:', createdTag.name);
  }

  // 5. Créer des articles
  const politiqueCategory = await prisma.category.findUnique({
    where: { slug: 'politique' }
  });

  const article1 = await prisma.article.create({
    data: {
      title: 'Nouvelle réforme du gouvernement ivoirien',
      slug: 'nouvelle-reforme-gouvernement-ivoirien',
      content: 'Le gouvernement ivoirien annonce une série de réformes majeures...',
      categoryId: politiqueCategory.id,
      authorId: journalist.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      viewCount: 150
    }
  });

  console.log('✅ Article créé:', article1.title);

  // 6. Créer des pharmacies
  const pharmacies = [
    {
      name: 'Pharmacie Centrale d\'Abidjan',
      address: 'Boulevard de la République',
      commune: 'Plateau',
      phone: '+225 27 20 21 22 23',
      latitude: 5.3164,
      longitude: -4.0271,
      isOnDuty: true
    },
    {
      name: 'Pharmacie du Bonheur',
      address: 'Avenue Chardy',
      commune: 'Cocody',
      phone: '+225 27 22 44 55 66',
      latitude: 5.3599,
      longitude: -3.9877,
      isOnDuty: false
    }
  ];

  for (const pharmacy of pharmacies) {
    const created = await prisma.pharmacy.create({ data: pharmacy });
    console.log('✅ Pharmacie créée:', created.name);
  }

  // 7. Créer une flash info
  const flashInfo = await prisma.flashInfo.create({
    data: {
      title: 'Coupure d\'eau programmée à Abidjan',
      content: 'La SODECI annonce une coupure d\'eau ce weekend dans plusieurs quartiers...',
      priority: 'HIGH',
      isActive: true
    }
  });

  console.log('✅ Flash info créée:', flashInfo.title);

  console.log('\n🎉 Seeding terminé avec succès!');
  console.log('\n📧 Identifiants de connexion:');
  console.log('   Admin: admin@yakroactu.com / YakroAdmin@2025!');
  console.log('   Journaliste: journalist@yakroactu.com / YakroAdmin@2025!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
