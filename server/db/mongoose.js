var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://thedirtydeveloper:buddy3907@ds151853.mlab.com:51853/porn');

module.exports = {mongoose};