const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER, // minutes
    allowNull: false,
    defaultValue: 60,
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
  passingMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 40,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
  },
}, {
  tableName: 'exams',
  timestamps: true,
});

Exam.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

module.exports = Exam;
