const express = require('express');

const router = express.Router();
const payments = new Map();

function createPaymentId() {
  return `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

router.post('/', (req, res) => {
  const { bookingId, amount, currency = 'USD' } = req.body;
  const numericAmount = Number(amount);

  if (!bookingId || typeof bookingId !== 'string') {
    return res.status(400).json({ error: 'bookingId is required' });
  }

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  if (!/^[A-Z]{3}$/.test(currency)) {
    return res.status(400).json({ error: 'currency must be a 3-letter ISO code' });
  }

  const payment = {
    paymentId: createPaymentId(),
    bookingId,
    status: 'authorized',
    amount: numericAmount,
    currency,
    provider: 'simulation',
    createdAt: new Date().toISOString(),
  };

  payments.set(payment.paymentId, payment);

  return res.status(201).json(payment);
});

router.get('/:paymentId', (req, res) => {
  const payment = payments.get(req.params.paymentId);

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  return res.json(payment);
});

module.exports = router;
