const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Exam = require('./Exam');

const ExamResult = sequelize.define('ExamResult', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  examId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Exam, key: 'id' },
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  percentage: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  answers: {
    type: DataTypes.JSON, // { questionId: selectedOption }
    allowNull: true,
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'exam_results',
  timestamps: true,
});

ExamResult.belongsTo(User, { foreignKey: 'userId', as: 'student' });
ExamResult.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

module.exports = ExamResult;
