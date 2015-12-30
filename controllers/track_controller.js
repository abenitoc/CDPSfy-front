var fs = require('fs');
var path = require('path');
var track_model = require('./../models/track');

// Devuelve una lista de las canciones disponibles y sus metadatos
exports.list = function (req, res) {
	var tracks = track_model.tracks;
	res.render('tracks/index', {tracks: tracks});
};

// Devuelve la vista del formulario para subir una nueva canción
exports.new = function (req, res) {
	res.render('tracks/new');
};

// Devuelve la vista de reproducción de una canción.
// El campo track.url contiene la url donde se encuentra el fichero de audio
exports.show = function (req, res) {
	var track = track_model.tracks[req.params.trackId];
	track.id = req.params.trackId;
	res.render('tracks/show', {track: track});
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

	console.log(name);
	// Aquí debe implementarse la escritura del fichero de audio (track.buffer) en tracks.cdpsfy.es
	// Esta url debe ser la correspondiente al nuevo fichero en tracks.cdpsfy.es

	var url = '/media/' + name + "." + extension;
	var write_path =  path.resolve(path.relative("/controllers","/CDPSfy/public/media/")) + "/" + name + "." + extension;
	console.log(write_path);
	fs.writeFile( write_path, track.buffer, function(err){
		if(err){
			return console.log(err);
		}
		console.log("The file was saved!");
	});

	// Escribe los metadatos de la nueva canción en el registro.
	track_model.tracks[id] = {
		name: name,
		url: url
	};

	res.redirect('/tracks');
};

// Borra una canción (trackId) del registro de canciones
// TODO:
// - Eliminar en tracks.cdpsfy.es el fichero de audio correspondiente a trackId
exports.destroy = function (req, res) {
	var trackId = req.params.trackId;
	var track = track_model.tracks[trackId];
	var track_url = track.url;
	// Aquí debe implementarse el borrado del fichero de audio indetificado por trackId en tracks.cdpsfy.es
	var deletion_path =  path.resolve(path.relative("/controllers","/CDPSfy/public/")) + track_url;
	console.log(deletion_path);
	fs.unlink(deletion_path);
	// Borra la entrada del registro de datos
	delete track_model.tracks[trackId];
	res.redirect('/tracks');
};
