import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  private readonly lemonSqueezyApiKey = this.config.get('LEMON_SQUEEZY_API_KEY');
  private readonly lemonSqueezyWebhookSecret = this.config.get('LEMON_SQUEEZY_WEBHOOK_SECRET');

  async createCheckoutSession(userId: string, priceId: string) {
    // TODO: Implement Lemon Squeezy checkout creation
    // This would create a checkout URL for the user to pay
    throw new BadRequestException('Payment integration in progress');
  }

  async handleWebhook(payload: any, signature: string) {
    // TODO: Verify webhook signature and process subscription events
    // Handle subscription_created, subscription_updated, subscription_cancelled
    throw new BadRequestException('Webhook handling in progress');
  }

  async getSubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId },
    });
  }

  async cancelSubscription(subscriptionId: string) {
    // TODO: Cancel subscription via Lemon Squeezy API
    throw new BadRequestException('Subscription cancellation in progress');
  }
}
