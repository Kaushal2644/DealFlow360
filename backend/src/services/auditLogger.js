import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({entityType, entityId, user, action, before = null, after = null, reason = '' }) => {
    try {
        await AuditLog.create({
            entityType,
            entityId,
            user: user?._id || user,
            action, 
            before, 
            after,
            reason,
        });
    } catch (err) {
        console.error("Audit log failed", err.message);
    }
}