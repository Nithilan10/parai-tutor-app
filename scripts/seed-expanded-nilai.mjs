/**
 * Expanded Nilai library with difficulty levels and practice variations
 * Run: node scripts/seed-expanded-nilai.mjs
 */

import prisma from '../lib/prisma.js';

const EXPANDED_NILAI = [
  // Beginner Level
  {
    name: 'Nilai 1 - Basics (Slow)',
    difficulty: 'beginner',
    order: 1,
    category: 'fundamentals',
    description: 'Master the basic ku-ku tha pattern at slow tempo',
    bpm: 60,
    beats: [
      { name: 'ku', type: 'right', order: 0, timing: 500 },
      { name: 'ku', type: 'right', order: 1, timing: 500 },
      { name: 'tha', type: 'left', order: 2, timing: 500 },
    ],
  },
  {
    name: 'Nilai 1 - Medium Speed',
    difficulty: 'beginner',
    order: 2,
    category: 'fundamentals',
    description: 'Same pattern, faster tempo',
    bpm: 90,
    beats: [
      { name: 'ku', type: 'right', order: 0, timing: 333 },
      { name: 'ku', type: 'right', order: 1, timing: 333 },
      { name: 'tha', type: 'left', order: 2, timing: 333 },
    ],
  },
  {
    name: 'Single Strokes Practice',
    difficulty: 'beginner',
    order: 3,
    category: 'warmup',
    description: 'Alternating left and right hand strikes',
    bpm: 80,
    beats: [
      { name: 'ku', type: 'right', order: 0, timing: 400 },
      { name: 'tha', type: 'left', order: 1, timing: 400 },
      { name: 'ku', type: 'right', order: 2, timing: 400 },
      { name: 'tha', type: 'left', order: 3, timing: 400 },
    ],
  },
  
  // Intermediate Level
  {
    name: 'Theem Introduction',
    difficulty: 'intermediate',
    order: 10,
    category: 'two-hand',
    description: 'Learn the powerful both-hands-together strike',
    bpm: 70,
    beats: [
      { name: 'ku', type: 'right', order: 0, timing: 500 },
      { name: 'theem', type: 'both', order: 1, timing: 500 },
      { name: 'tha', type: 'left', order: 2, timing: 500 },
    ],
  },
  {
    name: 'Quick Ku Pattern',
    difficulty: 'intermediate',
    order: 11,
    category: 'speed',
    description: 'Fast right-hand strikes for speed building',
    bpm: 120,
    beats: [
      { name: 'ku', type: 'right', order: 0, timing: 200 },
      { name: 'ku', type: 'right', order: 1, timing: 200 },
      { name: 'ku', type: 'right', order: 2, timing: 200 },
      { name: 'tha', type: 'left', order: 3, timing: 400 },
    ],
  },
  {
    name: 'Syncopated Rhythm',
    difficulty: 'intermediate',
    order: 12,
    category: 'rhythm',
    description: 'Off-beat pattern with varied timing',
    bpm: 90,
    beats: [
      { name: 'ku', type: 'right', order: 0, timing: 300 },
      { name: 'tha', type: 'left', order: 1, timing: 200 },
      { name: 'ku', type: 'right', order: 2, timing: 300 },
      { name: 'theem', type: 'both', order: 3, timing: 500 },
    ],
  },

  // Advanced Level
  {
    name: 'Speed Challenge',
    difficulty: 'advanced',
    order: 20,
    category: 'speed',
    description: 'Very fast alternating pattern - master precision at speed',
    bpm: 160,
    beats: [
      { name: 'ku', type: 'right', order: 0, timing: 150 },
      { name: 'tha', type: 'left', order: 1, timing: 150 },
      { name: 'ku', type: 'right', order: 2, timing: 150 },
      { name: 'tha', type: 'left', order: 3, timing: 150 },
      { name: 'theem', type: 'both', order: 4, timing: 300 },
    ],
  },
  {
    name: 'Complex Theem Pattern',
    difficulty: 'advanced',
    order: 21,
    category: 'two-hand',
    description: 'Multiple theem strikes with syncopation',
    bpm: 100,
    beats: [
      { name: 'theem', type: 'both', order: 0, timing: 400 },
      { name: 'ku', type: 'right', order: 1, timing: 200 },
      { name: 'tha', type: 'left', order: 2, timing: 200 },
      { name: 'theem', type: 'both', order: 3, timing: 400 },
      { name: 'ku', type: 'right', order: 4, timing: 200 },
    ],
  },
  {
    name: 'Traditional Attam Sequence',
    difficulty: 'advanced',
    order: 22,
    category: 'traditional',
    description: 'Classic Tamil parai attam rhythm sequence',
    bpm: 110,
    beats: [
      { name: 'ku', type: 'right', order: 0, timing: 250 },
      { name: 'ku', type: 'right', order: 1, timing: 250 },
      { name: 'tha', type: 'left', order: 2, timing: 250 },
      { name: 'theem', type: 'both', order: 3, timing: 400 },
      { name: 'ku', type: 'right', order: 4, timing: 200 },
      { name: 'tha', type: 'left', order: 5, timing: 200 },
      { name: 'theem', type: 'both', order: 6, timing: 500 },
    ],
  },

  // Practice Variations
  {
    name: 'Endurance Builder',
    difficulty: 'intermediate',
    order: 15,
    category: 'endurance',
    description: '16-beat pattern for building stamina',
    bpm: 100,
    beats: Array.from({ length: 16 }, (_, i) => ({
      name: i % 4 < 2 ? 'ku' : 'tha',
      type: i % 4 < 2 ? 'right' : 'left',
      order: i,
      timing: 300,
    })),
  },
  {
    name: 'Accent Practice',
    difficulty: 'intermediate',
    order: 16,
    category: 'dynamics',
    description: 'Practice dynamic control with accented beats',
    bpm: 85,
    beats: [
      { name: 'theem', type: 'both', order: 0, timing: 500 }, // Accent
      { name: 'ku', type: 'right', order: 1, timing: 250 },
      { name: 'tha', type: 'left', order: 2, timing: 250 },
      { name: 'ku', type: 'right', order: 3, timing: 250 },
      { name: 'theem', type: 'both', order: 4, timing: 500 }, // Accent
    ],
  },
];

async function seedExpandedNilai() {
  console.log('🌱 Seeding expanded Nilai library...');

  try {
    // Find or create tutorial
    let tutorial = await prisma.tutorial.findFirst({
      where: { title: 'Expanded Practice Library' },
    });

    if (!tutorial) {
      const adminUser = await prisma.user.findFirst();
      if (!adminUser) {
        console.error('❌ No users found. Create a user first.');
        return;
      }

      tutorial = await prisma.tutorial.create({
        data: {
          title: 'Expanded Practice Library',
          description: 'Comprehensive collection of Nilai patterns from beginner to advanced',
          authorId: adminUser.id,
        },
      });
      console.log('✅ Created tutorial:', tutorial.title);
    }

    // Seed each nilai
    for (const nilaiData of EXPANDED_NILAI) {
      const { beats, ...nilaiFields } = nilaiData;

      // Check if exists
      const existing = await prisma.nilai.findFirst({
        where: {
          name: nilaiFields.name,
          tutorialId: tutorial.id,
        },
      });

      if (existing) {
        console.log(`⏭️  Skipping existing: ${nilaiFields.name}`);
        continue;
      }

      // Create nilai with beats
      const nilai = await prisma.nilai.create({
        data: {
          ...nilaiFields,
          tutorialId: tutorial.id,
          beats: {
            create: beats,
          },
        },
        include: {
          beats: true,
        },
      });

      console.log(`✅ Created: ${nilai.name} (${beats.length} beats)`);
    }

    console.log('🎉 Expanded Nilai library seeded successfully!');
    console.log(`📊 Total patterns: ${EXPANDED_NILAI.length}`);
    console.log('📚 Categories: fundamentals, warmup, two-hand, speed, rhythm, traditional, endurance, dynamics');
  } catch (error) {
    console.error('❌ Error seeding Nilai:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedExpandedNilai();
