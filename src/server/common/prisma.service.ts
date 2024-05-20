import { Prisma, PrismaClient } from '@prisma/client';
import { Service } from 'typedi';

function createPrismaClient() {
  const nodeEnv = process.env.NODE_ENV || 'development';

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  prisma.$use(async (params, next) => {
    softDeleteMiddleware(params, softDeleteTargetTables);
    return next(params);
  });

  const softDeleteTargetTables: Prisma.ModelName[] = [
    Prisma.ModelName.User,
    Prisma.ModelName.Thread,
  ];

  /***********************************/
  /* SOFT DELETE MIDDLEWARE */
  /***********************************/
  const softDeleteMiddleware = (
    params: Prisma.MiddlewareParams,
    targets: Prisma.ModelName[],
  ) => {
    if (params.model && targets.includes(params.model)) {
      const currentTimestamp = new Date().getTime();
      switch (params.action) {
        case 'findUnique':
          params.action = 'findFirst';
          params.args.where['deletedAt'] = 0;
          break;
        case 'findFirst':
          params.args.where['deletedAt'] = 0;
          break;
        case 'findMany':
          if (params.args.where) {
            if (params.args.where.deletedAt == undefined) {
              params.args.where['deletedAt'] = 0;
            }
          } else {
            params.args['where'] = { deletedAt: 0 };
          }
          break;
        case 'update':
          params.action = 'updateMany';
          params.args.where['deletedAt'] = 0;
          break;
        case 'updateMany':
          if (params.args.where != undefined) {
            params.args.where['deletedAt'] = 0;
          } else {
            params.args['where'] = { deletedAt: 0 };
          }
          break;
        case 'delete':
          params.action = 'update';
          params.args['data'] = { deletedAt: currentTimestamp };
          if (params.args.where != undefined) {
            params.args.where['deletedAt'] = 0;
          } else {
            params.args['where'] = { deletedAt: 0 };
          }
          break;
        case 'deleteMany':
          params.action = 'updateMany';
          if (params.args.data != undefined) {
            params.args.data['deletedAt'] = currentTimestamp;
          } else {
            params.args['data'] = { deletedAt: currentTimestamp };
          }
          if (params.args.where != undefined) {
            params.args.where['deletedAt'] = 0;
          } else {
            params.args['where'] = { deletedAt: 0 };
          }
          break;
      }
    }
  };

  return prisma;
}

@Service({ factory: createPrismaClient })
export class PrismaService extends PrismaClient {}
