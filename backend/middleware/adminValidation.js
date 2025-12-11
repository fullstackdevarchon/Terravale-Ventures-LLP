// Validation middleware for admin operations
export const validateAdminRegistration = (req, res, next) => {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email, and password are required",
        });
    }

    // Validate name
    if (name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Name must be at least 2 characters long",
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format",
        });
    }

    // Validate password strength
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long",
        });
    }

    // Validate phone if provided
    if (req.body.phone) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(req.body.phone.replace(/\s/g, ""))) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be 10 digits",
            });
        }
    }

    next();
};

export const validateAdminLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required",
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format",
        });
    }

    next();
};

export const validateAdminUpdate = (req, res, next) => {
    const { name, email, password, phone } = req.body;

    // At least one field must be provided
    if (!name && !email && !password && !phone) {
        return res.status(400).json({
            success: false,
            message: "At least one field must be provided for update",
        });
    }

    // Validate name if provided
    if (name && name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Name must be at least 2 characters long",
        });
    }

    // Validate email if provided
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }
    }

    // Validate password if provided
    if (password && password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long",
        });
    }

    // Validate phone if provided
    if (phone) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be 10 digits",
            });
        }
    }

    next();
};

export const validateMongoId = (req, res, next) => {
    const { id } = req.params;

    // MongoDB ObjectId validation (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid admin ID format",
        });
    }

    next();
};
