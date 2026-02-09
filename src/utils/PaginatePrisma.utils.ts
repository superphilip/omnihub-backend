
import type { Prisma } from '../database/prismaClient.js';
import type { PaginationParams } from './PaginationTypes.utils.js';


export async function paginateResource<T, Where, OrderBy, Include = undefined>(
  model: {
    findMany: (args: Prisma.SelectSubset<{ where?: Where; skip?: number; take?: number; orderBy?: OrderBy; include?: Include }, any>) => Promise<T[]>;
    count: (args: { where?: Where }) => Promise<number>;
  },
  pagination: PaginationParams,
  options?: {
    where?: Where;
    orderBy?: OrderBy;
    include?: Include;
  }
): Promise<{ data: T[], meta: { total: number; page: number; limit: number; totalPages: number; } }> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      ...(options?.where ? { where: options.where } : {}),
      skip, take: limit,
      ...(options?.orderBy ? { orderBy: options.orderBy } : {}),
      ...(options?.include ? { include: options.include } : {}),
    }),
    model.count({ where: options?.where })
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  };
}