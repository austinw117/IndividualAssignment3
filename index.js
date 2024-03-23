var app = require( 'express' )();
var http = require( 'http' ).createServer( app ); 
const PORT = 3000; 
app.get( '/', function( req, res ) { res.send( 'Hello World' ); }); 
http.listen( PORT, function() { console.log( 'listening on *:' + PORT ); });
app.get( '/', function( req, res ) { res.sendFile( __dirname + '/public/index2.html' ); });