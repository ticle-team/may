import { Prisma } from '@prisma/client';
import { Service } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';

@Service()
export class ProjectStore {
  constructor(private readonly prisma: PrismaService) {}

  async findProjectById(projectId: number) {
    return this.prisma.shapleProject.findUnique({
      where: {
        id: projectId,
      },
    });
  }
}
