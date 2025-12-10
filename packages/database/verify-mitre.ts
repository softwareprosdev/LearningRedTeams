import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  const tactics = await prisma.mitreTactic.count();
  const techniques = await prisma.mitreTechnique.count();
  const subtechniques = await prisma.mitreSubtechnique.count();
  
  console.log('MITRE ATT&CK Data Verification:');
  console.log(`✅ Tactics: ${tactics}/14`);
  console.log(`✅ Techniques: ${techniques}`);
  console.log(`✅ Subtechniques: ${subtechniques}`);
  
  // Sample some tactics
  const sampleTactics = await prisma.mitreTactic.findMany({ take: 5 });
  console.log('\nSample Tactics:');
  sampleTactics.forEach(t => console.log(`  - ${t.id}: ${t.name}`));
  
  // Sample some techniques
  const sampleTechs = await prisma.mitreTechnique.findMany({ take: 5 });
  console.log('\nSample Techniques:');
  sampleTechs.forEach(t => console.log(`  - ${t.id}: ${t.name}`));
  
  // Sample some subtechniques
  const sampleSubs = await prisma.mitreSubtechnique.findMany({ take: 5 });
  console.log('\nSample Subtechniques:');
  sampleSubs.forEach(s => console.log(`  - ${s.id}: ${s.name}`));
  
  await prisma.$disconnect();
}

verify();
