/**
 * 🔒 SECURE CORS MIDDLEWARE
 * 
 * Reusable, production-ready CORS configuration for Express.js
 * 
 * Features:
 * - Whitelist-based origin validation
 * - Credential support with strict origin checking
 * - Security logging for blocked attempts
 * - Environment-based configuration
 * - Preflight request handling
 * 
 * Usage:
 *   import { configureCORS } from './middleware/corsConfig.js';
 *   configureCORS(app, options);
 */

import cors from 'cors';

/**
 * Configure CORS middleware for Express app
 * 
 * @param {Express} app - Express application instance
 * @param {Object} options - Configuration options
 * @param {Array<string>} options.allowedOrigins - Array of allowed origin URLs
 * @param {boolean} options.allowNoOrigin - Allow requests with no origin (default: true in dev, false in prod)
 * @param {Array<string>} options.methods - Allowed HTTP methods
 * @param {Array<string>} options.allowedHeaders - Allowed request headers
 * @param {Array<string>} options.exposedHeaders - Headers exposed to client
 * @param {number} options.maxAge - Preflight cache duration in seconds
 * @param {boolean} options.enableLogging - Log blocked CORS attempts
 */
export function configureCORS(app, options = {}) {
    // Default configuration
    const config = {
        allowedOrigins: options.allowedOrigins || [],
        allowNoOrigin: options.allowNoOrigin ?? (process.env.NODE_ENV !== 'production'),
        methods: options.methods || ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: options.allowedHeaders || [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
        ],
        exposedHeaders: options.exposedHeaders || ['Set-Cookie'],
        maxAge: options.maxAge || 86400, // 24 hours
        enableLogging: options.enableLogging ?? true,
    };

    // Validate configuration
    if (!Array.isArray(config.allowedOrigins) || config.allowedOrigins.length === 0) {
        console.warn('⚠️ CORS WARNING: No allowed origins specified. API will block all cross-origin requests.');
    }

    // CORS options
    const corsOptions = {
        origin: function (origin, callback) {
            // Handle requests with no origin (mobile apps, Postman, server-to-server)
            if (!origin) {
                if (config.allowNoOrigin) {
                    return callback(null, true);
                } else {
                    if (config.enableLogging) {
                        console.warn('🚨 CORS BLOCKED: Request with no origin header');
                    }
                    return callback(new Error('Origin not allowed by CORS'), false);
                }
            }

            // Check if origin is in whitelist
            if (config.allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                // Log unauthorized access attempts
                if (config.enableLogging) {
                    console.warn(`🚨 CORS BLOCKED: Unauthorized origin attempted access: ${origin}`);
                    console.warn(`   Allowed origins: ${config.allowedOrigins.join(', ')}`);
                }
                callback(new Error(`CORS policy: Origin ${origin} is not allowed`), false);
            }
        },

        // Enable credentials (cookies, authorization headers)
        credentials: true,

        // Allowed HTTP methods
        methods: config.methods,

        // Allowed headers
        allowedHeaders: config.allowedHeaders,

        // Expose custom headers to the client
        exposedHeaders: config.exposedHeaders,

        // Cache preflight requests
        maxAge: config.maxAge,

        // Allow preflight to succeed
        optionsSuccessStatus: 200,
    };

    // Apply CORS middleware
    app.use(cors(corsOptions));

    // Handle preflight requests explicitly
    app.options('*', cors(corsOptions));

    // Log configuration (only in development)
    if (process.env.NODE_ENV !== 'production') {
        console.log('✅ CORS Configuration Applied:');
        console.log(`   Allowed Origins: ${config.allowedOrigins.join(', ')}`);
        console.log(`   Allow No Origin: ${config.allowNoOrigin}`);
        console.log(`   Credentials: true`);
        console.log(`   Methods: ${config.methods.join(', ')}`);
    }
}

/**
 * Get allowed origins from environment variables
 * 
 * @returns {Array<string>} Array of allowed origins
 */
export function getOriginsFromEnv() {
    const origins = [
        // Local development origins
        process.env.DEV_FRONTEND_URL,
        process.env.DEV_ADMIN_URL,
        process.env.DEV_LABOUR_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',

        // Production origins
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        process.env.LABOUR_URL,
    ];

    // Remove undefined/null values and trailing slashes
    return origins
        .filter(Boolean)
        .map(url => url.replace(/\/+$/, ''))
        .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
}

/**
 * Validate CORS configuration
 * 
 * @param {Array<string>} origins - Array of origins to validate
 * @returns {Object} Validation result with errors and warnings
 */
export function validateCORSConfig(origins) {
    const errors = [];
    const warnings = [];

    // Check for wildcards
    if (origins.includes('*')) {
        errors.push('Wildcard origin (*) is not allowed with credentials');
    }

    // Check for HTTP in production
    if (process.env.NODE_ENV === 'production') {
        origins.forEach(origin => {
            if (origin.startsWith('http://') && !origin.includes('localhost')) {
                warnings.push(`HTTP origin in production: ${origin} (should use HTTPS)`);
            }
        });
    }

    // Check for localhost in production
    if (process.env.NODE_ENV === 'production') {
        origins.forEach(origin => {
            if (origin.includes('localhost')) {
                warnings.push(`Localhost origin in production: ${origin}`);
            }
        });
    }

    // Check for trailing slashes
    origins.forEach(origin => {
        if (origin.endsWith('/')) {
            warnings.push(`Origin has trailing slash: ${origin} (will be normalized)`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Create a CORS error handler middleware
 * 
 * @returns {Function} Express error handler middleware
 */
export function corsErrorHandler() {
    return (err, req, res, next) => {
        if (err.message && err.message.includes('CORS')) {
            return res.status(403).json({
                error: 'CORS Error',
                message: 'This origin is not allowed to access this resource',
                origin: req.headers.origin || 'unknown',
            });
        }
        next(err);
    };
}

// Export default configuration for common use cases
export default {
    configureCORS,
    getOriginsFromEnv,
    validateCORSConfig,
    corsErrorHandler,
};
