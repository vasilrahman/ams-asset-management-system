const { sequelize, User, Asset, VerificationLog } = require('./database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        await sequelize.sync({ force: true }); // Reset DB
        console.log('Database cleared.');

        // Create Users
        const adminPassword = await bcrypt.hash('admin@123', 10);
        const staffPassword = await bcrypt.hash('staff@123', 10);

        await User.bulkCreate([
            {
                id: 'u1',
                name: 'Admin User',
                username: 'admin123',
                password: adminPassword,
                role: 'ADMIN',
                designation: 'System Administrator',
                phone: '555-0101',
                email: 'admin@ams.com',
                isActive: true,
                avatarUrl: 'https://picsum.photos/100/100?random=1',
            },
            {
                id: 'u2',
                name: 'John Staff',
                username: 'staff123',
                password: staffPassword,
                role: 'STAFF',
                designation: 'IT Support',
                phone: '555-0102',
                email: 'john@ams.com',
                isActive: true,
                avatarUrl: 'https://picsum.photos/100/100?random=2',
            }
        ]);

        // Create Assets
        await Asset.bulkCreate([
            {
                id: 'AST-001',
                name: 'MacBook Pro M2',
                category: 'Laptop',
                serialNumber: 'MBP2023-001',
                status: 'Active',
                imageUrl: 'https://picsum.photos/200/200?random=10',
                purchaseDate: '2023-01-15',
                createdDate: '2023-01-15',
                addedBy: 'Admin User',
                isQrGenerated: true,
                location: 'HQ - Floor 1',
                lastVerifiedDate: new Date().toISOString(),
                verifiedBy: 'John Staff'
            },
            {
                id: 'AST-002',
                name: 'Dell XPS 15',
                category: 'Laptop',
                serialNumber: 'DXP15-998',
                status: 'Active',
                imageUrl: 'https://picsum.photos/200/200?random=11',
                purchaseDate: '2023-02-10',
                createdDate: '2023-02-10',
                addedBy: 'Admin User',
                isQrGenerated: true,
                location: 'HQ - Floor 2'
            },
            {
                id: 'AST-003',
                name: 'Canon EOS R5',
                category: 'Camera',
                serialNumber: 'CAN-R5-112',
                status: 'Maintenance',
                imageUrl: 'https://picsum.photos/200/200?random=12',
                purchaseDate: '2022-11-05',
                createdDate: '2022-11-05',
                addedBy: 'Admin User',
                isQrGenerated: false,
                location: 'Studio A'
            }
        ]);

        // Create Logs
        await VerificationLog.create({
            id: 'L1',
            assetId: 'AST-001',
            assetName: 'MacBook Pro M2',
            verifiedBy: 'John Staff',
            timestamp: new Date().toISOString()
        });

        console.log('Database seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await sequelize.close();
    }
};

seedDatabase();
