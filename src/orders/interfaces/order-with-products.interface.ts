import { OrderStatus } from '@prisma/client';

export interface OrderWithProducts {
  id: string;
  totalAmount: number;
  totalItems: number;
  status: OrderStatus;
  paid: boolean;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  OrderItem: {
    name: any;
    id: string;
    productId: number;
    quantity: number;
    price: number;
  }[];
}
