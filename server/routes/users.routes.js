const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../database');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all users
router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Create user
router.post('/', authenticateToken, async (req, res) => {
    const { password, ...userData } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            ...userData,
            password: hashedPassword
        });

        const { password: _, ...userWithoutPassword } = newUser.toJSON();
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
    const { password, ...updates } = req.body;

    try {
        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        const [updated] = await User.update(updates, {
            where: { id: req.params.id }
        });

        if (updated) {
            const updatedUser = await User.findByPk(req.params.id, {
                attributes: { exclude: ['password'] }
            });
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// Delete user
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deleted = await User.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.json({ message: 'User deleted' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

module.exports = router;
