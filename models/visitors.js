const mongoose = require('mongoose');

const visitorsSchema = mongoose.Schema({
  month: {
    type: String,
  },
  visitors: {
    type: Number,
  },
  year: {
    type: String,
  }
});

module.exports = mongoose.model('visitors', visitorsSchema);
