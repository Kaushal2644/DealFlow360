import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {success, failure} from '../utils/apiResponse.js';
import {env} from '../config/env.js';
import {logAudit} from '../services/auditLogger.js';

const generateToken = (userId) =>
  jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const signup = asyncHandler(async (req, res) => {
    console.log('Headers:', req.headers['content-type']);
console.log('Body:', req.body);
  const { name, email, password, role, team } = req.body || {};

  if (!name || !email || !password) {
    return failure(res, 'Name, email and password are required', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return failure(res, 'A user with this email already exists', 409);
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role, team });

  await logAudit({
    entityType: 'User',
    entityId: user._id,
    user: user._id,
    action: 'signup',
    after: { name: user.name, email: user.email, role: user.role },
  });

  const token = generateToken(user._id);

  return success(
    res,
    {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, team: user.team },
    },
    'Signup successful',
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return failure(res, 'Email and password are required', 400);
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return failure(res, 'Invalid email or password', 401);
  }

  if (!user.isActive) {
    return failure(res, 'This account has been deactivated', 403);
  }

  const token = generateToken(user._id);

  return success(res, {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, team: user.team },
  }, 'Login successful');
});

export const getMe = asyncHandler(async (req, res) => {
  return success(res, { user: req.user }, 'Current user fetched');
});