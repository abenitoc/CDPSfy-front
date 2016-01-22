/*

Modelo de datos de canciones (track)

track_id: {
	name: nombre de la canción,
	url: url del fichero de audio
}

*/

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var db = mongoose.connect('mongodb://localhost/tracks');

var trackSchema = new Schema({
  name:  String,
  url: String
});


var Track = mongoose.model('Track', trackSchema);
