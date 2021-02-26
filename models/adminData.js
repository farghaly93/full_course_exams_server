const mongoose = require('mongoose');

const adminData = mongoose.Schema({
  admin: {
    type: Number,
    default: 1,
  },
  instructions: {
    type: String,
    default: ''
  },
  siteName: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  phone: {
    type: Number,
    default: 0
  },
  address: {
    type: String,
    default: ''
  },
  career: {
    type: String,
    default: ''
  },
  facebook: {
    type: String,
    default: ''
  },
  gmail: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  whatsapp: {
    type: String,
    default: ''
  },
  youtubeSecret: {
    type: String,
    default: ''
  },
  activityDegree: {
    type: Number,
    default: 0
  }
  
});

module.exports = mongoose.model('adminData',adminData);
