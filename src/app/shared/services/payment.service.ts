import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Stripe from 'stripe';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(environment.stripe.secretKey, {
      apiVersion: '2025-03-31.basil'
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw error;
    }
  }
} 