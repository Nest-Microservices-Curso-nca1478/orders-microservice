import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class OrderItemDto {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price: number;
}
