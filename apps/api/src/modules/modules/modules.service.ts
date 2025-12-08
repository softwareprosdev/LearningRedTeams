import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto, UpdateModuleDto } from './dto';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  async findByCourseId(courseId: string): Promise<any[]> {
    return this.prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string): Promise<any> {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return module;
  }

  async create(data: CreateModuleDto): Promise<any> {
    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if order already exists for this course
    const existing = await this.prisma.module.findFirst({
      where: {
        courseId: data.courseId,
        order: data.order,
      },
    });

    if (existing) {
      throw new ConflictException(
        'A module with this order already exists in this course',
      );
    }

    return this.prisma.module.create({
      data: {
        title: data.title,
        description: data.description,
        order: data.order,
        courseId: data.courseId,
      },
      include: {
        lessons: true,
      },
    });
  }

  async update(id: string, data: UpdateModuleDto): Promise<any> {
    const module = await this.prisma.module.findUnique({ where: { id } });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Check order uniqueness if order or courseId is being updated
    if (
      (data.order !== undefined && data.order !== module.order) ||
      (data.courseId && data.courseId !== module.courseId)
    ) {
      const courseId = data.courseId || module.courseId;
      const order = data.order !== undefined ? data.order : module.order;

      const existing = await this.prisma.module.findFirst({
        where: {
          courseId,
          order,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          'A module with this order already exists in this course',
        );
      }
    }

    return this.prisma.module.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.courseId && { courseId: data.courseId }),
      },
      include: {
        lessons: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    const module = await this.prisma.module.findUnique({ where: { id } });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    await this.prisma.module.delete({ where: { id } });
  }

  async reorder(courseId: string, moduleOrders: { id: string; order: number }[]): Promise<any[]> {
    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Update all modules in a transaction
    await this.prisma.$transaction(
      moduleOrders.map(({ id, order }) =>
        this.prisma.module.update({
          where: { id },
          data: { order },
        }),
      ),
    );

    return this.findByCourseId(courseId);
  }
}
