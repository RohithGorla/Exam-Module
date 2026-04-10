const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Exam = require('./Exam');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  examId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Exam, key: 'id' },
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  optionA: { type: DataTypes.STRING(300), allowNull: false },
  optionB: { type: DataTypes.STRING(300), allowNull: false },
  optionC: { type: DataTypes.STRING(300), allowNull: true },
  optionD: { type: DataTypes.STRING(300), allowNull: true },
  correctAnswer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false,
  },
  marks: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'questions',
  timestamps: true,
});

Question.belongsTo(Exam, { foreignKey: 'examId' });
Exam.hasMany(Question, { foreignKey: 'examId', as: 'questions' });

module.exports = Question;
