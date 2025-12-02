const express = require('express');
const cors = require('cors');
const { sequelize } = require('./database');
const authRoutes = require('./routes/auth.routes');
const assetRoutes = require('./routes/assets.routes');
const userRoutes = require('./routes/users.routes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/users', userRoutes);

// Sync Database and Start Server
sequelize.sync({ force: false }) // Set force: true to reset DB
    .then(() => {
        console.log('Database synced');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to sync database:', err);
    });
