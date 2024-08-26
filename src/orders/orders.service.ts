import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { ChangeStatusOrderDto, PaginationOrderDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database Connected');
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({
      data: createOrderDto,
    });
  }

  async findAll(paginationOrderDto: PaginationOrderDto) {
    const totalPages = await this.order.count({
      where: {
        status: paginationOrderDto.status,
      },
    });

    const currentPage = paginationOrderDto.page;
    const perPage = paginationOrderDto.limit;

    return {
      data: await this.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: paginationOrderDto.status,
        },
      }),
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / perPage),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: { id },
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id #${id} not found`,
      });
    }

    return order;
  }

  async changeStatus(changeStatusOrder: ChangeStatusOrderDto) {
    const { id, status } = changeStatusOrder;

    const order = await this.findOne(id);

    if (order.status === status) {
      return order;
    }

    return await this.order.update({
      where: { id },
      data: { status },
    });
  }
}
