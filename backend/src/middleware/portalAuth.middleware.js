import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import Customer from '../models/Customer.js';

export const protectPortal = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    if (decoded.type !== 'customer_portal') {
      return res.status(403).json({ success: false, message: 'Invalid token type for portal access' });
    }

    const customer = await Customer.findById(decoded.id).select('-portalPasswordHash');
    if (!customer || !customer.isActive) {
      return res.status(401).json({ success: false, message: 'Customer not found or inactive' });
    }

    req.customer = customer;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};