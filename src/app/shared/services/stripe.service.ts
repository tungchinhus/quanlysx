import { Injectable } from '@angular/core';
//import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  // private stripe: Promise<Stripe | null>;

  constructor() {
    // this.stripe = loadStripe(environment.stripe.publishableKey);
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency }),
      });
      
      const data = await response.json();
      return data.clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(clientSecret: string, paymentMethod: any) {
    // const stripe = await this.stripe;
    // if (!stripe) {
    //   throw new Error('Stripe failed to initialize');
    // }

    // const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    //   payment_method: paymentMethod.id,
    // });

    // if (error) {
    //   throw error;
    // }

    return null;//paymentIntent;
  }
} 