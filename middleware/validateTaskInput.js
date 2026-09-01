// Runs before the task controller — rejects malformed input early so the
// database (and Mongoose validation errors) never has to deal with it.
function validateTaskInput(req, res, next) {
  const { title } = req.body;

  // For PUT, title is optional (partial update) — but if it IS sent, it must be valid.
  const isCreate = req.method === 'POST';

  if (isCreate && (!title || typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({
      error: 'Bad Request',
      message: "Field 'title' is required and must be a non-empty string",
    });
  }

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({
      error: 'Bad Request',
      message: "Field 'title' must be a non-empty string",
    });
  }

  next();
}

module.exports = validateTaskInput;
