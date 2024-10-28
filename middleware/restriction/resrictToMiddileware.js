export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // return next(new AppError("You do not have permission to perfom this action", 403))
      return res.status(400).json({
        status: 'failure',
        message: 'You do not have permission to perfom this action'
      });
    }
    next();
  };
};
