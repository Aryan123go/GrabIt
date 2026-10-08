import assert from 'node:assert/strict'
import test from 'node:test'
import { createCorsOptions } from '../config/cors.js'
import { getCookieOptions } from '../controllers/customer.controllers.js'

test('CORS allows configured origins and credentials', () => {
    const options = createCorsOptions('https://grabit.example, https://admin.example')

    assert.equal(options.credentials, true)
    assert.deepEqual(options.methods, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    options.origin('https://grabit.example', (error, allowed) => {
        assert.equal(error, null)
        assert.equal(allowed, true)
    })
    options.origin('https://admin.example', (error, allowed) => {
        assert.equal(error, null)
        assert.equal(allowed, true)
    })
})

test('CORS rejects unconfigured browser origins but permits requests without an Origin', () => {
    const options = createCorsOptions('https://grabit.example')

    options.origin('https://untrusted.example', (error, allowed) => {
        assert.equal(error, null)
        assert.equal(allowed, false)
    })
    options.origin(undefined, (error, allowed) => {
        assert.equal(error, null)
        assert.equal(allowed, true)
    })
})

test('production auth cookies work across services and cover all API paths', () => {
    const previousNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
        assert.deepEqual(getCookieOptions(), {
            httpOnly: true,
            path: '/',
            secure: true,
            sameSite: 'none'
        })
    } finally {
        if (previousNodeEnv === undefined) delete process.env.NODE_ENV
        else process.env.NODE_ENV = previousNodeEnv
    }
})

test('development auth cookies remain usable on localhost', () => {
    const previousNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    try {
        assert.deepEqual(getCookieOptions(), {
            httpOnly: true,
            path: '/',
            secure: false,
            sameSite: 'lax'
        })
    } finally {
        if (previousNodeEnv === undefined) delete process.env.NODE_ENV
        else process.env.NODE_ENV = previousNodeEnv
    }
})
