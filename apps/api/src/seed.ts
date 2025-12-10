import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@zerodayinstitute.com' },
    update: {},
    create: {
      email: 'admin@zerodayinstitute.com',
      passwordHash: await bcrypt.hash('Admin123!@#', 12),
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      emailVerified: true,
    },
  });

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        passwordHash: await bcrypt.hash('User123!@#', 12),
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        email: 'jane.smith@example.com',
        passwordHash: await bcrypt.hash('User123!@#', 12),
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'STUDENT',
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'alice.johnson@example.com' },
      update: {},
      create: {
        email: 'alice.johnson@example.com',
        passwordHash: await bcrypt.hash('User123!@#', 12),
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'INSTRUCTOR',
        emailVerified: true,
      },
    }),
  ]);

  console.log('✅ Users created');

  // Create sample courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Introduction to Cybersecurity',
        slug: 'intro-to-cybersecurity',
        description:
          'Learn the fundamentals of cybersecurity, including threat landscape, basic defense mechanisms, and security best practices.',
        difficulty: 'BEGINNER',
        category: 'GENERAL',
        price: 0,
        isFree: true,
        isPublished: true,
        duration: 240, // 4 hours
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Web Application Security',
        slug: 'web-app-security',
        description:
          'Deep dive into web application security vulnerabilities and how to protect against them.',
        difficulty: 'INTERMEDIATE',
        category: 'RED_TEAM',
        price: 9999, // $99.99 in cents
        isFree: false,
        isPublished: true,
        duration: 480, // 8 hours
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Network Security Fundamentals',
        slug: 'network-security-fundamentals',
        description:
          'Master the basics of network security, including firewalls, intrusion detection, and network protocols.',
        difficulty: 'BEGINNER',
        category: 'BLUE_TEAM',
        price: 0,
        isFree: true,
        isPublished: true,
        duration: 360, // 6 hours
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Ethical Hacking and Penetration Testing',
        slug: 'ethical-hacking-penetration-testing',
        description: 'Learn ethical hacking techniques and penetration testing methodologies.',
        difficulty: 'ADVANCED',
        category: 'RED_TEAM',
        price: 19999, // $199.99 in cents
        isFree: false,
        isPublished: true,
        duration: 720, // 12 hours
        thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
      },
    }),
  ]);

  console.log('✅ Courses created');

  // Create modules for each course
  const modules: any[] = [];

  // Modules for Introduction to Cybersecurity
  modules.push(
    await prisma.module.create({
      data: {
        title: 'Cybersecurity Basics',
        description: 'Understanding the fundamentals of cybersecurity',
        order: 1,
        courseId: courses[0].id,
      },
    }),
    await prisma.module.create({
      data: {
        title: 'Threat Landscape',
        description: 'Overview of common cyber threats',
        order: 2,
        courseId: courses[0].id,
      },
    }),
    await prisma.module.create({
      data: {
        title: 'Security Best Practices',
        description: 'Essential security practices for individuals and organizations',
        order: 3,
        courseId: courses[0].id,
      },
    }),
  );

  // Modules for Web Application Security
  modules.push(
    await prisma.module.create({
      data: {
        title: 'OWASP Top 10',
        description: 'Understanding the OWASP Top 10 vulnerabilities',
        order: 1,
        courseId: courses[1].id,
      },
    }),
    await prisma.module.create({
      data: {
        title: 'Input Validation',
        description: 'Proper input validation techniques',
        order: 2,
        courseId: courses[1].id,
      },
    }),
    await prisma.module.create({
      data: {
        title: 'Authentication & Authorization',
        description: 'Securing authentication and authorization mechanisms',
        order: 3,
        courseId: courses[1].id,
      },
    }),
  );

  console.log('✅ Modules created');

  // Create lessons for each module
  const lessons: any[] = [];

  // Lessons for Cybersecurity Basics module
  lessons.push(
    await prisma.lesson.create({
      data: {
        title: 'What is Cybersecurity?',
        type: 'TEXT',
        textContent:
          'Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks...',
        order: 1,
        moduleId: modules[0].id,
      },
    }),
    await prisma.lesson.create({
      data: {
        title: 'CIA Triad',
        type: 'TEXT',
        textContent: 'The CIA Triad consists of Confidentiality, Integrity, and Availability...',
        order: 2,
        moduleId: modules[0].id,
      },
    }),
    await prisma.lesson.create({
      data: {
        title: 'Security Frameworks',
        type: 'TEXT',
        textContent: 'Introduction to various security frameworks and standards...',
        order: 3,
        moduleId: modules[0].id,
      },
    }),
  );

  // Lessons for Threat Landscape module
  lessons.push(
    await prisma.lesson.create({
      data: {
        title: 'Common Attack Vectors',
        type: 'TEXT',
        textContent: 'Understanding different attack vectors used by malicious actors...',
        order: 1,
        moduleId: modules[1].id,
      },
    }),
    await prisma.lesson.create({
      data: {
        title: 'Malware Types',
        type: 'TEXT',
        textContent: 'Overview of various types of malware and their characteristics...',
        order: 2,
        moduleId: modules[1].id,
      },
    }),
  );

  console.log('✅ Lessons created');

  // Create challenges
  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        title: 'SQL Injection Detection',
        description: 'Identify and exploit SQL injection vulnerabilities in a web application',
        difficulty: 'INTERMEDIATE',
        category: 'WEB_SECURITY',
        points: 100,
        flag: 'ZDI{SQL_INJECTION_MASTER}',
        isPublished: true,
      },
    }),
    prisma.challenge.create({
      data: {
        title: 'XSS Challenge',
        description: 'Find and exploit cross-site scripting vulnerabilities',
        difficulty: 'BEGINNER',
        category: 'WEB_SECURITY',
        points: 75,
        flag: 'ZDI{XSS_DETECTOR}',
        isPublished: true,
      },
    }),
    prisma.challenge.create({
      data: {
        title: 'Network Reconnaissance',
        description: 'Perform network reconnaissance and identify open ports',
        difficulty: 'BEGINNER',
        category: 'NETWORKING',
        points: 50,
        flag: 'ZDI{NETWORK_SCOUT}',
        isPublished: true,
      },
    }),
    prisma.challenge.create({
      data: {
        title: 'Cryptography Puzzle',
        description: 'Decrypt a message using various cryptographic techniques',
        difficulty: 'ADVANCED',
        category: 'CRYPTOGRAPHY',
        points: 150,
        flag: 'ZDI{CRYPTO_WIZARD}',
        isPublished: true,
      },
    }),
  ]);

  console.log('✅ Challenges created');

  // Note: Lab creation skipped as it requires lesson associations and complex setup
  // Labs can be created through the API after lessons are properly configured
  console.log('⏭️  Labs creation skipped (requires lesson associations)');

  // Create achievements
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        points: 10,
        type: 'LESSON_COMPLETE',
        criteria: { count: 1 },
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Course Explorer',
        description: 'Complete your first course',
        icon: '📚',
        points: 50,
        type: 'COURSE_COMPLETE',
        criteria: { count: 1 },
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Challenge Conqueror',
        description: 'Solve your first challenge',
        icon: '🏆',
        points: 25,
        type: 'CHALLENGE_COMPLETE',
        criteria: { count: 1 },
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Security Enthusiast',
        description: 'Complete 5 cybersecurity lessons',
        icon: '🛡️',
        points: 100,
        type: 'LESSON_COMPLETE',
        criteria: { count: 5 },
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Point Collector',
        description: 'Earn 500 points',
        icon: '⭐',
        points: 75,
        type: 'POINTS_MILESTONE',
        criteria: { points: 500 },
      },
    }),
  ]);

  console.log('✅ Achievements created');

  // Create sample enrollments
  await Promise.all([
    prisma.enrollment.create({
      data: {
        userId: users[0].id,
        courseId: courses[0].id,
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: users[1].id,
        courseId: courses[0].id,
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: users[0].id,
        courseId: courses[1].id,
      },
    }),
  ]);

  console.log('✅ Enrollments created');

  // Create sample progress
  await Promise.all([
    prisma.progress.create({
      data: {
        userId: users[0].id,
        lessonId: lessons[0].id,
        completed: true,
        watchTime: 1800, // 30 minutes in seconds
      },
    }),
    prisma.progress.create({
      data: {
        userId: users[0].id,
        lessonId: lessons[1].id,
        completed: true,
        watchTime: 2700, // 45 minutes in seconds
      },
    }),
    prisma.progress.create({
      data: {
        userId: users[1].id,
        lessonId: lessons[0].id,
        completed: false,
        watchTime: 900, // 15 minutes in seconds
      },
    }),
  ]);

  console.log('✅ Progress created');

  // Create sample gamification data
  await Promise.all([
    prisma.userStats.create({
      data: {
        userId: users[0].id,
        totalPoints: 350,
        level: 3,
        currentStreak: 7,
        longestStreak: 10,
        lessonsCompleted: 5,
        coursesCompleted: 1,
        challengesCompleted: 2,
      },
    }),
    prisma.userStats.create({
      data: {
        userId: users[1].id,
        totalPoints: 150,
        level: 2,
        currentStreak: 3,
        longestStreak: 5,
        lessonsCompleted: 2,
        coursesCompleted: 0,
        challengesCompleted: 1,
      },
    }),
    prisma.userStats.create({
      data: {
        userId: adminUser.id,
        totalPoints: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lessonsCompleted: 0,
        coursesCompleted: 0,
        challengesCompleted: 0,
      },
    }),
  ]);

  console.log('✅ User stats created');

  // Create user achievements
  await Promise.all([
    prisma.userAchievement.create({
      data: {
        userId: users[0].id,
        achievementId: achievements[0].id,
        earnedAt: new Date(),
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[0].id,
        achievementId: achievements[2].id,
        earnedAt: new Date(),
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[1].id,
        achievementId: achievements[0].id,
        earnedAt: new Date(),
      },
    }),
  ]);

  console.log('✅ User achievements created');

  // Create challenge submissions
  await Promise.all([
    prisma.submission.create({
      data: {
        userId: users[0].id,
        challengeId: challenges[1].id,
        flag: 'ZDI{XSS_DETECTOR}',
        isCorrect: true,
        points: 75,
      },
    }),
    prisma.submission.create({
      data: {
        userId: users[1].id,
        challengeId: challenges[2].id,
        flag: 'ZDI{NETWORK_SCOUT}',
        isCorrect: true,
        points: 50,
      },
    }),
  ]);

  console.log('✅ Challenge submissions created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- Admin User: admin@zerodayinstitute.com / Admin123!@#`);
  console.log(`- Student Users: john.doe@example.com / User123!@#`);
  console.log(`                  jane.smith@example.com / User123!@#`);
  console.log(`                  alice.johnson@example.com / User123!@#`);
  console.log(`- ${courses.length} Courses created`);
  console.log(`- ${modules.length} Modules created`);
  console.log(`- ${lessons.length} Lessons created`);
  console.log(`- ${challenges.length} Challenges created`);
  console.log(`- ${achievements.length} Achievements created`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
