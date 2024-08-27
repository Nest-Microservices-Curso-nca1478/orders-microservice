import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { ChangeStatusOrderDto, PaginationOrderDto } from './dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { NATS_SERVICE } from '../config';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database Connected');
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      // obtener los ids de los products
      const productIds = createOrderDto.items.map((item) => item.productId);

      const products: any[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, productIds),
      );

      // calcular los valores
      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const price = products.find(
          (product) => product.id === orderItem.productId,
        ).price;

        return acc + price * orderItem.quantity;
      }, 0);

      const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity;
      }, 0);

      // creando la orden junto con los orderItems
      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                price: products.find(
                  (product) => product.id === orderItem.productId,
                ).price,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
              })),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              id: true,
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });

      // respuesta listando los OrderItems y los productos con sus nombres
      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => {
          return {
            ...orderItem,
            name: products.find((product) => product.id === orderItem.productId)
              .name,
          };
        }),
      };
    } catch (error) {
      throw new RpcException(error);
    }
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
      include: {
        OrderItem: {
          select: {
            id: true,
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id #${id} not found`,
      });
    }

    // obteniendo los productsId y productos de cada OrderItem
    const productIds = order.OrderItem.map((item) => item.productId);
    const products: any[] = await firstValueFrom(
      this.client.send({ cmd: 'validate_products' }, productIds),
    );

    // procesando a respuesta
    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => {
        return {
          ...orderItem,
          name: products.find((product) => product.id === orderItem.productId)
            .name,
        };
      }),
    };
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
