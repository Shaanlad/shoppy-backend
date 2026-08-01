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
    return this.createCheckoutSession(request.productId);
    // Implement the logic to create a checkout session with Stripe
    // You can use the Stripe SDK to create a session and return the session ID
  }
}
