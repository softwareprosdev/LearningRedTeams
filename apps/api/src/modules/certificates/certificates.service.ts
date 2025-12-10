import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async generateCertificate(userId: string, courseId: string) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if user is enrolled and has completed the course
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('You are not enrolled in this course');
    }

    if (enrollment.progress < 100) {
      throw new BadRequestException('You must complete the course before generating a certificate');
    }

    // Check if certificate already exists
    const existingCertificate = await this.prisma.certificate.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (existingCertificate) {
      throw new ConflictException('Certificate already exists for this course');
    }

    // Generate unique certificate ID and verification hash
    const certificateId = this.generateCertificateId();
    const verificationHash = this.generateVerificationHash(userId, courseId, certificateId);

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create certificate record
    const certificate = await this.prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateId,
        verificationHash,
        pdfUrl: `/certificates/${certificateId}.pdf`, // Placeholder URL
        issuedAt: new Date(),
      },
    });

    return {
      ...certificate,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      course: {
        title: course.title,
      },
    };
  }

  async getMyCertificates(userId: string) {
    const certificates = await this.prisma.certificate.findMany({
      where: {
        userId,
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });

    // Fetch course details for each certificate
    const certificatesWithDetails = await Promise.all(
      certificates.map(async (cert) => {
        const course = await this.prisma.course.findUnique({
          where: { id: cert.courseId },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            difficulty: true,
            category: true,
          },
        });

        return {
          ...cert,
          course,
        };
      }),
    );

    return certificatesWithDetails;
  }

  async getCertificateById(certificateId: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: {
        certificateId,
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    // Get user and course details
    const user = await this.prisma.user.findUnique({
      where: { id: certificate.userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    const course = await this.prisma.course.findUnique({
      where: { id: certificate.courseId },
      select: {
        title: true,
        description: true,
        difficulty: true,
        category: true,
      },
    });

    return {
      ...certificate,
      user,
      course,
    };
  }

  async verifyCertificate(certificateId: string, verificationHash: string) {
    const certificate = await this.prisma.certificate.findFirst({
      where: {
        certificateId,
        verificationHash,
      },
    });

    if (!certificate) {
      return {
        valid: false,
        message: 'Certificate not found or verification hash is invalid',
      };
    }

    // Get user and course details
    const user = await this.prisma.user.findUnique({
      where: { id: certificate.userId },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    const course = await this.prisma.course.findUnique({
      where: { id: certificate.courseId },
      select: {
        title: true,
      },
    });

    return {
      valid: true,
      certificate: {
        certificateId: certificate.certificateId,
        issuedAt: certificate.issuedAt,
        userName: `${user?.firstName} ${user?.lastName}`,
        courseName: course?.title,
      },
    };
  }

  private generateCertificateId(): string {
    // Generate format: ZDI-XXXXXXXXXX (ZeroDay Institute)
    const randomPart = crypto.randomBytes(5).toString('hex').toUpperCase();
    return `ZDI-${randomPart}`;
  }

  private generateVerificationHash(
    userId: string,
    courseId: string,
    certificateId: string,
  ): string {
    const data = `${userId}-${courseId}-${certificateId}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
