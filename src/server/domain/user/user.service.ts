import { getLogger } from '@/logger';
import { Service } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { UserStore } from '@/server/domain/user/user.store';

const logger = getLogger('UserService');

@Service()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userStore: UserStore,
  ) {}

  async getUser(ownerId: string) {
    return this.userStore.getUser(this.prisma, ownerId);
  }
}
