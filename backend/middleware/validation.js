const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

const validateRegistration = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateTrip = [
  body('name').trim().isLength({ min: 1 }).withMessage('Trip name is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Trip description is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  handleValidationErrors
];

const validateTripStop = [
  body('cityId').isInt({ min: 1 }).withMessage('Valid city ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('orderNum').isInt({ min: 0 }).withMessage('Valid order number is required'),
  handleValidationErrors
];

const validateActivity = [
  body('name').trim().isLength({ min: 1 }).withMessage('Activity name is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Activity description is required'),
  body('type').trim().isLength({ min: 1 }).withMessage('Activity type is required'),
  body('cost').isFloat({ min: 0 }).withMessage('Valid cost is required'),
  body('duration').isInt({ min: 1 }).withMessage('Valid duration is required'),
  handleValidationErrors
];

const validateBudgetItem = [
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateTrip,
  validateTripStop,
  validateActivity,
  validateBudgetItem
}; 