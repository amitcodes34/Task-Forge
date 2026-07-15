const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../config/database');

const router = express.Router();

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const paymentIntent = event.data.object;
    const projectId = paymentIntent.metadata?.project_id;

    if (!projectId) {
      return res.json({ received: true });
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await prisma.project.update({
          where: { id: projectId },
          data: { escrowStatus: 'funded' },
        });
        break;
      case 'payment_intent.payment_failed':
        await prisma.project.update({
          where: { id: projectId },
          data: {
            escrowStatus: 'refunded',
            status: 'OPEN',
            winningBidId: null, // Reset winning bid so they can accept another
          },
        });
        break;
      case 'charge.dispute.created':
        // Optionally flag for admin here. We'll just log it for now.
        console.warn(`Dispute created for project ${projectId}`);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error(`Webhook processing error:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  res.json({ received: true });
});

module.exports = router;
