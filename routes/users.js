const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

// Route to get all users
router.get('/', protect, authorize('admin', 'user'), getUsers);

// Route to update user
router.put('/:userId', protect, authorize('admin', 'user'), updateUser);

// Route to delete user
router.delete('/:userId', protect, authorize('admin','user'), deleteUser);

module.exports = router;

