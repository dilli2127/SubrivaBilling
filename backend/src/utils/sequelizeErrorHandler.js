export function formatSequelizeError(error) {
    const message = error?.message || '';
    const name = error?.name || '';

    // NOT NULL violation
    if (message.includes('notNull Violation')) {
        const field = extractFieldFromMessage(message, /([a-zA-Z0-9_]+)\s+cannot be null/);
        return {
            message: `${formatFieldName(field)} is missing`,
            statusCode: 412,
        };
    }

    // UNIQUE constraint violation
    if (name === 'SequelizeUniqueConstraintError') {
        const field = error?.errors?.[0]?.path || 'Field';
        return {
            message: `${formatFieldName(field)} must be unique`,
            statusCode: 409,
        };
    }

    // FOREIGN KEY constraint violation
    if (name === 'SequelizeForeignKeyConstraintError') {
        const field = error?.index || error?.table || 'Field';
        return {
            message: `Invalid reference in ${formatFieldName(field)}`,
            statusCode: 409,
        };
    }

    // Validation errors (e.g. email format, length, etc.)
    if (name === 'SequelizeValidationError') {
        const field = error?.errors?.[0]?.path || 'Field';
        const errMsg = error?.errors?.[0]?.message || 'Validation failed';
        return {
            message: `${formatFieldName(field)}: ${errMsg}`,
            statusCode: 422,
        };
    }

    // Fallback for Sequelize or unknown errors
    return {
        message: message || 'Something went wrong',
        statusCode: 500,
    };
}

// Extract field from Sequelize message using a regex
function extractFieldFromMessage(message, regex) {
    return message.match(regex)?.[1] || 'Field';
}

// Format: tenant_id → Tenant Id
function formatFieldName(field) {
    return field
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
