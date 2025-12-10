import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // Mock course data for when database is not available
  private getMockCourses(): any[] {
    return [
      // RED TEAM COURSES
      {
        id: '1',
        title: 'Ethical Hacking Fundamentals',
        slug: 'ethical-hacking-fundamentals',
        description:
          'Master the fundamentals of ethical hacking and penetration testing. Learn reconnaissance, vulnerability assessment, and exploitation techniques.',
        difficulty: 'BEGINNER',
        category: 'RED_TEAM',
        price: 0,
        isFree: true,
        isPublished: true,
        duration: '8 hours',
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop',
      },
      {
        id: '2',
        title: 'Advanced Web Application Penetration Testing',
        slug: 'advanced-web-app-pentest',
        description:
          'Deep dive into advanced web application security testing. Master OWASP Top 10, SQL injection, XSS, CSRF, and more.',
        difficulty: 'ADVANCED',
        category: 'RED_TEAM',
        price: 299,
        isFree: false,
        isPublished: true,
        duration: '16 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      },
      {
        id: '3',
        title: 'Network Penetration Testing',
        slug: 'network-penetration-testing',
        description:
          'Comprehensive course on network security testing, covering reconnaissance, scanning, exploitation, and post-exploitation techniques.',
        difficulty: 'INTERMEDIATE',
        category: 'RED_TEAM',
        price: 199,
        isFree: false,
        isPublished: true,
        duration: '12 hours',
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
      },
      {
        id: '4',
        title: 'Social Engineering & Physical Security',
        slug: 'social-engineering-physical-security',
        description:
          'Learn the art of social engineering and physical security testing. Understand human psychology and physical security measures.',
        difficulty: 'INTERMEDIATE',
        category: 'RED_TEAM',
        price: 149,
        isFree: false,
        isPublished: true,
        duration: '6 hours',
        thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
      },
      {
        id: '5',
        title: 'Metasploit Framework Mastery',
        slug: 'metasploit-framework-mastery',
        description:
          'Complete guide to using Metasploit for penetration testing. Learn exploitation, post-exploitation, and custom module development.',
        difficulty: 'ADVANCED',
        category: 'RED_TEAM',
        price: 249,
        isFree: false,
        isPublished: true,
        duration: '10 hours',
        thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
      },

      // BLUE TEAM COURSES
      {
        id: '6',
        title: 'Incident Response & Digital Forensics',
        slug: 'incident-response-digital-forensics',
        description:
          'Master the fundamentals of incident response and digital forensics. Learn to investigate security incidents and gather digital evidence.',
        difficulty: 'INTERMEDIATE',
        category: 'BLUE_TEAM',
        price: 199,
        isFree: false,
        isPublished: true,
        duration: '14 hours',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      },
      {
        id: '7',
        title: 'Security Operations Center (SOC) Fundamentals',
        slug: 'soc-fundamentals',
        description:
          'Learn how to operate and manage a Security Operations Center. Master SIEM tools, threat hunting, and security monitoring.',
        difficulty: 'BEGINNER',
        category: 'BLUE_TEAM',
        price: 0,
        isFree: true,
        isPublished: true,
        duration: '10 hours',
        thumbnail: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=300&fit=crop',
      },
      {
        id: '8',
        title: 'Threat Hunting & Analysis',
        slug: 'threat-hunting-analysis',
        description:
          'Advanced threat hunting techniques and analysis. Learn to proactively hunt for threats using various tools and methodologies.',
        difficulty: 'ADVANCED',
        category: 'BLUE_TEAM',
        price: 279,
        isFree: false,
        isPublished: true,
        duration: '18 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
      },
      {
        id: '9',
        title: 'Vulnerability Management & Assessment',
        slug: 'vulnerability-management',
        description:
          'Complete guide to vulnerability management. Learn vulnerability scanning, assessment, prioritization, and remediation.',
        difficulty: 'INTERMEDIATE',
        category: 'BLUE_TEAM',
        price: 179,
        isFree: false,
        isPublished: true,
        duration: '12 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop',
      },
      {
        id: '10',
        title: 'Network Security Monitoring',
        slug: 'network-security-monitoring',
        description:
          'Learn to implement and manage network security monitoring solutions. Master intrusion detection, analysis, and response.',
        difficulty: 'INTERMEDIATE',
        category: 'BLUE_TEAM',
        price: 199,
        isFree: false,
        isPublished: true,
        duration: '15 hours',
        thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
      },

      // PURPLE TEAM COURSES
      {
        id: '11',
        title: 'Purple Team Operations',
        slug: 'purple-team-operations',
        description:
          'Learn to bridge the gap between red and blue teams. Master collaboration techniques and threat simulation exercises.',
        difficulty: 'ADVANCED',
        category: 'PURPLE_TEAM',
        price: 249,
        isFree: false,
        isPublished: true,
        duration: '12 hours',
        thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
      },
      {
        id: '12',
        title: 'MITRE ATT&CK Framework Implementation',
        slug: 'mitre-attack-framework',
        description:
          'Master the MITRE ATT&CK framework for threat modeling and security assessment. Learn to map threats to ATT&CK techniques.',
        difficulty: 'INTERMEDIATE',
        category: 'PURPLE_TEAM',
        price: 179,
        isFree: false,
        isPublished: true,
        duration: '8 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=300&fit=crop',
      },
      {
        id: '13',
        title: 'Adversary Simulation & Emulation',
        slug: 'adversary-simulation-emulation',
        description:
          'Learn to simulate real-world adversaries and test security defenses. Master APT emulation and threat simulation.',
        difficulty: 'ADVANCED',
        category: 'PURPLE_TEAM',
        price: 299,
        isFree: false,
        isPublished: true,
        duration: '16 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=300&fit=crop',
      },

      // GOVERNANCE & COMPLIANCE
      {
        id: '14',
        title: 'Cybersecurity Governance & Risk Management',
        slug: 'cybersecurity-governance-risk',
        description:
          'Learn to develop cybersecurity governance frameworks and manage organizational risk effectively.',
        difficulty: 'INTERMEDIATE',
        category: 'GOVERNANCE',
        price: 199,
        isFree: false,
        isPublished: true,
        duration: '10 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop',
      },
      {
        id: '15',
        title: 'GDPR & Data Protection Compliance',
        slug: 'gdpr-data-protection-compliance',
        description:
          'Master GDPR compliance and data protection regulations. Learn to implement privacy by design and manage data breaches.',
        difficulty: 'BEGINNER',
        category: 'GOVERNANCE',
        price: 149,
        isFree: false,
        isPublished: true,
        duration: '6 hours',
        thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
      },
      {
        id: '16',
        title: 'NIST Cybersecurity Framework Implementation',
        slug: 'nist-cybersecurity-framework',
        description:
          'Complete guide to implementing the NIST Cybersecurity Framework in your organization.',
        difficulty: 'INTERMEDIATE',
        category: 'GOVERNANCE',
        price: 179,
        isFree: false,
        isPublished: true,
        duration: '8 hours',
        thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
      },

      // SECURITY ARCHITECTURE
      {
        id: '17',
        title: 'Secure Software Development',
        slug: 'secure-software-development',
        description:
          'Learn to integrate security into the software development lifecycle. Master secure coding practices and DevSecOps.',
        difficulty: 'INTERMEDIATE',
        category: 'SECURITY_ARCHITECTURE',
        price: 199,
        isFree: false,
        isPublished: true,
        duration: '14 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      },
      {
        id: '18',
        title: 'Cloud Security Architecture',
        slug: 'cloud-security-architecture',
        description:
          'Master cloud security architecture for AWS, Azure, and GCP. Learn to design secure cloud infrastructure.',
        difficulty: 'ADVANCED',
        category: 'SECURITY_ARCHITECTURE',
        price: 249,
        isFree: false,
        isPublished: true,
        duration: '16 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      },
      {
        id: '19',
        title: 'Zero Trust Security Model',
        slug: 'zero-trust-security-model',
        description:
          'Learn to implement Zero Trust security architecture. Master identity verification and micro-segmentation.',
        difficulty: 'ADVANCED',
        category: 'SECURITY_ARCHITECTURE',
        price: 279,
        isFree: false,
        isPublished: true,
        duration: '12 hours',
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
      },

      // INDUSTRY CERTIFICATIONS
      {
        id: '20',
        title: 'CISSP Certification Preparation',
        slug: 'cissp-certification-prep',
        description:
          'Comprehensive CISSP certification preparation course covering all 8 domains of cybersecurity.',
        difficulty: 'ADVANCED',
        category: 'CERTIFICATION',
        price: 399,
        isFree: false,
        isPublished: true,
        duration: '40 hours',
        thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
      },
      {
        id: '21',
        title: 'CEH Certification Preparation',
        slug: 'ceh-certification-prep',
        description:
          'Complete CEH certification preparation with hands-on labs and practice exams.',
        difficulty: 'INTERMEDIATE',
        category: 'CERTIFICATION',
        price: 299,
        isFree: false,
        isPublished: true,
        duration: '25 hours',
        thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
      },
      {
        id: '22',
        title: 'Security+ Certification Preparation',
        slug: 'security-plus-certification-prep',
        description:
          'CompTIA Security+ certification preparation course for cybersecurity professionals.',
        difficulty: 'BEGINNER',
        category: 'CERTIFICATION',
        price: 199,
        isFree: false,
        isPublished: true,
        duration: '20 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop',
      },
      {
        id: '23',
        title: 'CISM Certification Preparation',
        slug: 'cism-certification-prep',
        description:
          'CISM certification preparation focusing on information security management and governance.',
        difficulty: 'INTERMEDIATE',
        category: 'CERTIFICATION',
        price: 249,
        isFree: false,
        isPublished: true,
        duration: '18 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop',
      },

      // EMERGING TECHNOLOGIES
      {
        id: '24',
        title: 'IoT Security Fundamentals',
        slug: 'iot-security-fundamentals',
        description:
          'Learn to secure Internet of Things (IoT) devices and networks. Covering device security, communication protocols, and privacy.',
        difficulty: 'INTERMEDIATE',
        category: 'EMERGING_TECH',
        price: 179,
        isFree: false,
        isPublished: true,
        duration: '10 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
      },
      {
        id: '25',
        title: 'Artificial Intelligence Security',
        slug: 'artificial-intelligence-security',
        description:
          'Explore security challenges in AI and machine learning systems. Learn about adversarial attacks and AI safety.',
        difficulty: 'ADVANCED',
        category: 'EMERGING_TECH',
        price: 299,
        isFree: false,
        isPublished: true,
        duration: '14 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
      },
      {
        id: '26',
        title: 'Blockchain Security & Cryptocurrency',
        slug: 'blockchain-security-cryptocurrency',
        description:
          'Master blockchain security fundamentals and cryptocurrency wallet protection.',
        difficulty: 'INTERMEDIATE',
        category: 'EMERGING_TECH',
        price: 199,
        isFree: false,
        isPublished: true,
        duration: '8 hours',
        thumbnail:
          'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop',
      },
      {
        id: '27',
        title: '5G Network Security',
        slug: '5g-network-security',
        description:
          'Learn to secure 5G networks and understand new security challenges in next-generation telecommunications.',
        difficulty: 'ADVANCED',
        category: 'EMERGING_TECH',
        price: 249,
        isFree: false,
        isPublished: true,
        duration: '12 hours',
        thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      },
    ];
  }

  async findAll(): Promise<any[]> {
    try {
      return await this.prisma.course.findMany({
        where: {
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          difficulty: true,
          category: true,
          price: true,
          isFree: true,
          isPublished: true,
          duration: true,
          thumbnail: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      // If database query fails, return mock data
      console.log('Database not available, using mock courses data');
      return this.getMockCourses();
    }
  }

  async findBySlug(slug: string): Promise<any> {
    // Check if prisma is available (real database connection)
    if (!this.prisma || !this.prisma.course) {
      const mockCourse = this.getMockCourses().find((course) => course.slug === slug);
      if (mockCourse) {
        return {
          ...mockCourse,
          modules: [],
          mitreMappings: [],
        };
      }
      return null;
    }

    try {
      return await this.prisma.course.findUnique({
        where: { slug },
        include: {
          modules: {
            include: {
              lessons: true,
            },
          },
          mitreMappings: {
            include: {
              tactic: true,
              technique: true,
            },
          },
        },
      });
    } catch (error) {
      // If database query fails, try to find in mock data
      const mockCourse = this.getMockCourses().find((course) => course.slug === slug);
      if (mockCourse) {
        return {
          ...mockCourse,
          modules: [],
          mitreMappings: [],
        };
      }
      return null;
    }
  }

  async findById(id: string): Promise<any> {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
        mitreMappings: {
          include: {
            tactic: true,
            technique: true,
          },
        },
      },
    });
  }

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  async findAllAdmin(): Promise<any[]> {
    return this.prisma.course.findMany({
      include: {
        modules: true,
        enrollments: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: CreateCourseDto): Promise<any> {
    // Check if slug already exists
    const existing = await this.prisma.course.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictException('A course with this slug already exists');
    }

    return this.prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        thumbnail: data.thumbnail,
        difficulty: data.difficulty,
        category: data.category,
        price: data.price,
        isFree: data.isFree,
        isPublished: data.isPublished || false,
        duration: data.duration,
        prerequisites: data.prerequisites || [],
        learningOutcomes: data.learningOutcomes || [],
      },
    });
  }

  async update(id: string, data: UpdateCourseDto): Promise<any> {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check slug uniqueness if slug is being updated
    if (data.slug && data.slug !== course.slug) {
      const existing = await this.prisma.course.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new ConflictException('A course with this slug already exists');
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description && { description: data.description }),
        ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.category && { category: data.category }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.prerequisites && { prerequisites: data.prerequisites }),
        ...(data.learningOutcomes && { learningOutcomes: data.learningOutcomes }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.prisma.course.delete({ where: { id } });
  }

  async publish(id: string): Promise<any> {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  async unpublish(id: string): Promise<any> {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        isPublished: false,
      },
    });
  }
}
