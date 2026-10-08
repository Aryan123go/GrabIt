import Razorpay from 'razorpay'

const createRazorpayClient = () => {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const hasPlaceholder = /placeholder|your[_ -]?key|replace[_ -]?me|dummy/i.test(`${keyId || ''} ${keySecret || ''}`)

    if (!keyId || !keySecret || !keyId.startsWith('rzp_test_') || hasPlaceholder) {
        return null
    }

    return {
        keyId,
        client: new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        })
    }
}

export default createRazorpayClient
