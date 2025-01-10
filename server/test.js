const mongoose = require('mongoose');
const problems = require('./database/problems');

const testCaseSchema = new mongoose.Schema({
  input: String,
  output: String,
  operations: [String],
  size: Number,
});

const problemSchema = new mongoose.Schema({
  title: String,
  description: String,
  input: String,
  output: String,
  testCases: [testCaseSchema],
});

const Problem = mongoose.model('Problem', problemSchema);

mongoose.connect('mongodb+srv://bhuneshwar17100:bhuneshwar123@cluster0.qj6qwxz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Problems data:', problems);
    return Problem.insertMany(problems);
  })
  .then(() => {
    console.log('Problems inserted successfully');
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('Error inserting problems:', err);
    mongoose.disconnect();
  });