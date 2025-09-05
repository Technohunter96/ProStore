import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderToPaid } from '@/lib/actions/order.actions';

export async function POST(req: NextRequest) {
  console.log('Webhook received');

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    console.log('Signature:', signature ? 'Present' : 'Missing');
    console.log('Webhook secret:', process.env.STRIPE_WEBHOOK_SECRET ? 'Present' : 'Missing');

    // Build the webhook event
    const event = await Stripe.webhooks.constructEvent(
      body,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );

    console.log('Event type:', event.type);

    // Check for successful payment
    if (event.type === 'charge.succeeded') {
      const { object } = event.data;
      console.log('Processing charge.succeeded for orderId:', object.metadata.orderId);

      // Update order status
      await updateOrderToPaid({
        orderId: object.metadata.orderId,
        paymentResult: {
          id: object.id,
          status: 'COMPLETED',
          email_address: object.billing_details.email!,
          pricePaid: (object.amount / 100).toFixed(),
        },
      });

      console.log('Order updated successfully');
      return NextResponse.json({
        message: 'updateOrderToPaid was successful',
      });
    }

    console.log('Event type not handled:', event.type);
    return NextResponse.json({
      message: 'event is not charge.succeeded',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }
}
