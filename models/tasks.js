const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is highly required'],
    minlength: [3, 'Title must be at least 3 characters long']
  },
  description: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  // Supplementary Task: Enum Validation
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority level'
    },
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Supplementary Task: Pre-save hook to trim whitespace
// No "next" argument -> Mongoose treats this as synchronous and
// automatically continues once the function finishes running.
taskSchema.pre('save', function () {
  if (this.title) {
    this.title = this.title.trim(); // " My Task " -> "My Task"
  }
});

module.exports = mongoose.model('Task', taskSchema);