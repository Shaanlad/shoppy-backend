import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly stripe: Stripe,
    private readonly productService: ProductsService,
    private readonly configService: ConfigService,
  ) {}

  async createCheckoutSession(productId: number) {
    // Fetch the product details using the productId
    const product = await this.productService.getProduct(productId);
    return this.stripe.checkout.sessions.create({
      metadata: {
        productId,
      },
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price * 100, // Stripe expects the amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: this.configService.getOrThrow('STRIPE_SUCCESS_URL'),
      cancel_url: this.configService.getOrThrow('STRIPE_CANCEL_URL'),
    });
  }

  async handleCheckoutWebhook(payload: any) {
    console.log('Received Stripe webhook event:', payload);
    if (payload.type !== 'checkout.session.completed') {
      return;
    }

    const session = await this.stripe.checkout.sessions.retrieve(
      payload.data.object.id,
    );

    console.log('Retrieved session:', session);
    
    await this.productService.updateProduct(
      parseInt(session.metadata.productId),
      { sold: true },
    );
  }
}
