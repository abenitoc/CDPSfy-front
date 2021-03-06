var fs = require('fs');
var path = require('path');
var async = require('async');
var request = require('request');
var http = require('http');
var track_model = require('./../models/track');
var FormData = require('form-data');
var mongoose = require('mongoose');
var Track = mongoose.model('Track');

// Devuelve una lista de las canciones disponibles y sus metadatos
exports.list = function (req, res) {
		tracks = {};
	  Track.find({}, function (err,tracky) {
			console.log(tracky);
			tracky.forEach(function(tr){
				tracks[tr.name] = tr;
			});
			res.render('tracks/index', {tracks: tracks});
	});

};

// Devuelve la vista del formulario para subir una nueva canción
exports.new = function (req, res) {
	res.render('tracks/new');
};

// Devuelve la vista de reproducción de una canción.
// El campo track.url contiene la url donde se encuentra el fichero de audio
exports.show = function (req, res) {
	var track = req.params.trackId;
	console.log(track);
	Track.findOne({ 'name': track }, 'name url', function(err,tracky){
		  console.log(tracky);
			res.render('tracks/show', {track: tracky});
	});

};

// Escribe una nueva canción en el registro de canciones.
// TODO:
// - Escribir en tracks.cdpsfy.es el fichero de audio contenido en req.files.track.buffer
// - Escribir en el registro la verdadera url generada al añadir el fichero en el servidor tracks.cdpsfy.es
exports.create = function (req, res) {
	var track = req.files.track;
	console.log('Nuevo fichero de audio. Datos: ', track);
	var id = track.name.split('.')[0];
	var name = track.originalname.split('.')[0];
	var extension = track.extension;
	var url = 'http://tracks.cdpsfy.com/';

	// Aquí debe implementarse la escritura del fichero de audio (track.buffer) en tracks.cdpsfy.es
	// Esta url debe ser la correspondiente al nuevo fichero en tracks.cdpsfy.es
	async.series([function(callback){
		var formData = {
			track: {
		    value:  track.buffer,
		    options: {
		      filename: name + "." + extension ,
					id : id,
					extension: extension,
		      contentType: track.mimetype
		    }
		  }
		};
		console.log(formData);
		request.post({
			url: url,
			formData: formData
		}
		, function optionalCallback(err, httpResponse, body) {
	  if (err) {
	    return console.error('upload failed:', err);
			callback(null, "error");
		}
	  	console.log('Upload successful!  Server responded with:', body);
			console.log("body: " + body);
			var bodyjson = JSON.parse(body);
			callback(null,bodyjson["url"]);
		});

	}],
	function(err,results){
		console.log("results: " + results.response);
		if(results.status != "error"){
			console.log(url + "/" +  results[0]);
			/*track_model.tracks[id] = {
				name: name,
				url: url +"/"+ results[0]
			};*/

			var new_track = new Track({name : name,
				url: url +"/"+ results[0]
			});
			new_track.save();

		}
		res.redirect('/tracks');
	})
	// Escribe los metadatos de la nueva canción en el registro.

};

// Borra una canción (trackId) del registro de canciones
// TODO:
// - Eliminar en tracks.cdpsfy.es el fichero de audio correspondiente a trackId
exports.destroy = function (req, res) {
	var trackId = req.params.trackId;
	Track.findOne({ '_id': trackId }, 'url', function(err,tracky){
			track_url = tracky.url;
			// Borra la entrada del registro de datos
			request.del(track_url);
			//TODO: Handle errors
			Track.findByIdAndRemove( tracky._id, function(err,tracko){
					res.redirect('/tracks');
			});
	});
};
