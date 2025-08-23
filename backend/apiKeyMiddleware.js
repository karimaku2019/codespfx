const apiKey = process.env.API_KEY;

module.exports = function(req, res, next) {
  const key = req.header('x-api-key');
  if (!key || key !== apiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
