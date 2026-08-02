import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSessionRequest } from './dto/create-session.request';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(@Body() request: CreateSessionRequest) {
    return this.checkoutService.createCheckoutSession(request.productId);
  }

  @Post('webhook')
  async handleCheckoutWebhook(@Body() payload: any) {
    return this.checkoutService.handleCheckoutWebhook(payload);
  }
}
