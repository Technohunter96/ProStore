import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderToPaid } from '@/lib/actions/order.actions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  console.log('🔥 Webhook received');

  try {
    // Získej RAW body - toto je klíčové!
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    console.log('Body length:', body.length);
    console.log('Signature present:', !!signature);

    if (!signature) {
      console.log('❌ No stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('❌ STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Construct event s raw body
    console.log('🔍 Constructing event with signature verification...');
    const event = stripe.webhooks.constructEvent(
      body, // RAW body jako string
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    console.log('✅ Event verified and constructed:', event.type);

    // Handle charge.succeeded
    if (event.type === 'charge.succeeded') {
      const charge = event.data.object as Stripe.Charge;

      console.log('💰 Processing payment');
      console.log('Order ID:', charge.metadata?.orderId);
      console.log('Amount:', charge.amount);
      console.log('Email:', charge.billing_details?.email);

      if (!charge.metadata?.orderId) {
        console.log('❌ No orderId in metadata');
        return NextResponse.json({ error: 'No orderId found' }, { status: 400 });
      }

      // Update order
      await updateOrderToPaid({
        orderId: charge.metadata.orderId,
        paymentResult: {
          id: charge.id,
          status: 'COMPLETED',
          email_address: charge.billing_details?.email || '',
          pricePaid: (charge.amount / 100).toFixed(2),
        },
      });

      console.log('✅ Order updated successfully!');
      return NextResponse.json({
        received: true,
        message: 'Payment processed successfully',
      });
    }

    // Other event types
    console.log('ℹ️ Event type not handled:', event.type);
    return NextResponse.json({
      received: true,
      message: `Event ${event.type} received but not processed`,
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);

    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      console.error('❌ Invalid signature:', error.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Test endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint is ready',
    timestamp: new Date().toISOString(),
  });
}
