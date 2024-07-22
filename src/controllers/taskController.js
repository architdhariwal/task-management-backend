const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const task = new Task({ ...req.body, user: req.user._id });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.updateTask = async (req, res) => {
    try {
      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true }
      );
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};