import { Controller, Post, Body, Headers, Get, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout')
  async createCheckout(@Body() body: { userId: string; priceId: string }) {
    return this.paymentsService.createCheckoutSession(body.userId, body.priceId);
  }

  @Post('webhooks/lemonsqueezy')
  async handleWebhook(@Body() payload: any, @Headers('x-signature') signature: string) {
    return this.paymentsService.handleWebhook(payload, signature);
  }

  @Get('subscription/:userId')
  async getSubscription(@Param('userId') userId: string) {
    return this.paymentsService.getSubscription(userId);
  }

  @Post('cancel/:subscriptionId')
  async cancelSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.paymentsService.cancelSubscription(subscriptionId);
  }
}
