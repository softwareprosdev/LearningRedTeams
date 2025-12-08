import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<any[]> {
    return this.prisma.course.findMany({
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
  }

  async findBySlug(slug: string): Promise<any> {
    return this.prisma.course.findUnique({
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
