const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  key: {
    type: String,
    required: true,
  },
  startTime: {
    type: Number,
    required: true,
  },
  endTime: {
    type: Number,
    required: true,
  },
});

const songSchema = new Schema({
  notes: [noteSchema],
});

module.exports = mongoose.model("songs", songSchema);
