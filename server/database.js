const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  })
  : new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
  });

// --- Models ---

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'STAFF'),
    defaultValue: 'STAFF'
  },
  designation: DataTypes.STRING,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  avatarUrl: DataTypes.STRING
});

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  serialNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('Active', 'Maintenance', 'Retired', 'Lost'),
    defaultValue: 'Active'
  },
  imageUrl: DataTypes.STRING,
  purchaseDate: DataTypes.DATEONLY,
  createdDate: DataTypes.DATEONLY,
  addedBy: DataTypes.STRING, // Store name for simplicity, or could be FK
  isQrGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  location: DataTypes.STRING,
  lastVerifiedDate: DataTypes.DATE,
  verifiedBy: DataTypes.STRING
});

const VerificationLog = sequelize.define('VerificationLog', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  assetId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  assetName: DataTypes.STRING,
  verifiedBy: DataTypes.STRING,
  timestamp: DataTypes.DATE
});

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  assetId: DataTypes.STRING,
  assetName: DataTypes.STRING,
  reportedBy: DataTypes.STRING,
  date: DataTypes.DATEONLY,
  description: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('Pending', 'Resolved'),
    defaultValue: 'Pending'
  }
});

// Relationships
Asset.hasMany(VerificationLog, { foreignKey: 'assetId' });
VerificationLog.belongsTo(Asset, { foreignKey: 'assetId' });

Asset.hasMany(Complaint, { foreignKey: 'assetId' });
Complaint.belongsTo(Asset, { foreignKey: 'assetId' });

module.exports = {
  sequelize,
  User,
  Asset,
  VerificationLog,
  Complaint
};
