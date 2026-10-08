import assert from 'node:assert/strict'
import test from 'node:test'
import createRazorpayClient from '../config/razorpay.js'

test('Razorpay client requires real-looking test credentials', () => {
    const originalKeyId = process.env.RAZORPAY_KEY_ID
    const originalKeySecret = process.env.RAZORPAY_KEY_SECRET

    try {
        delete process.env.RAZORPAY_KEY_ID
        delete process.env.RAZORPAY_KEY_SECRET
        assert.equal(createRazorpayClient(), null)

        process.env.RAZORPAY_KEY_ID = 'rzp_test_placeholder'
        process.env.RAZORPAY_KEY_SECRET = 'placeholder'
        assert.equal(createRazorpayClient(), null)

        process.env.RAZORPAY_KEY_ID = 'rzp_test_demo_key'
        process.env.RAZORPAY_KEY_SECRET = 'demo_secret_value'
        const razorpay = createRazorpayClient()
        assert.equal(razorpay.keyId, 'rzp_test_demo_key')
        assert.ok(razorpay.client)
    } finally {
        if (originalKeyId === undefined) {
            delete process.env.RAZORPAY_KEY_ID
        } else {
            process.env.RAZORPAY_KEY_ID = originalKeyId
        }
        if (originalKeySecret === undefined) {
            delete process.env.RAZORPAY_KEY_SECRET
        } else {
            process.env.RAZORPAY_KEY_SECRET = originalKeySecret
        }
    }
})
