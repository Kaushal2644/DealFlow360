import Customer from '../models/Customer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, failure } from '../utils/apiResponse.js';

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  return success(res, customer, 'Customer created', 201);
});

export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ isActive: true });
  return success(res, customers, 'Customers fetched');
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const cust = await Customer.findByIdAndDelete(req.params.id);
  if(!cust) {
    return res.status(404).json({err: 'customer does not exist'});
  }
  return success(res, cust, 'Customer is deleted');
})