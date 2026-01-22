const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user.roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
    next();
  };
};

export default requireRole;
