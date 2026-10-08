export const createCorsOptions = (
    origins = process.env.ALLOWED_ORIGINS || 'http://localhost:5173'
) => {
    const allowedOrigins = origins.split(',').map((origin) => origin.trim()).filter(Boolean)

    return {
        origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    }
}
