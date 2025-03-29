var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var questionSchema = new Schema({
	'text' : String,
	'userId' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'views' : Number
});

module.exports = mongoose.model('question', questionSchema);
