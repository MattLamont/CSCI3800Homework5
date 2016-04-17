/**
 * Created by matt on 4/6/16.
 */

'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 http://www.w3schools.com/js/js_strict.asp
 */

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

 It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var request = require( 'request' );
var async = require( 'async' );
//var usergrid = require( 'node_modules/usergrid' );

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
 - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
 - Or the operationId associated with the operation in your Swagger document

 In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
 we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
    getMovie: getMovie,
    postMovie: postMovie,
    deleteMovie: deleteMovie
};




/*
 Functions in a127 controllers used for operations should take two parameters:

 Param 1: a handle to the request object
 Param 2: a handle to the response object
 */
function getMovie(req, res) {
    

    //If the request specifies that they want both movies and reviews
    async.parallel([

            //call the movie first
            function(callback) {

                var url
                    =
                    "https://api.usergrid.com/mattlamont/sandbox/movies?ql="
                    +
                    req.swagger.params.ql.value;

                request(url,
                    function (err,
                              response,
                              body) {

                    // JSON body
                        if (err) {
                            console.log(err);
                            callback(true);
                            return;
                        }

                        var obj = JSON.parse(body);

                        callback(false, obj);//callback final

                    });
            },

            //query the review with corresponding movie name
            function(callback) {

                var url
                    =
                    "https://api.usergrid.com/mattlamont/sandbox/reviews?ql="
                    +
                    req.swagger.params.ql.value;

                request(url,
                    function (err,
                              response,
                              body) {

                        // JSON body
                        if (err) {
                            console.log(err);
                            callback(true);
                            return;
                        }

                        var obj = JSON.parse(body);

                        callback(false, obj); // callback final

                    });

            },

        ],

        //final callback
        function (err, results) {

            if (err) {
                console.log(err);
                res.send(500,"Severe Error on Server");
                return;
            }

            if( req.swagger.params.reviews.value == true )
            res.send({
                Movies: results[0],
                Reviews: results[1]
            });

            else{
                res.send({Movies: results[0]});
            }


        });


}


function postMovie(req, res) {

    console.log( "Posting JSON to database: \n" + JSON.stringify( req.body ) );

    if( !req.body.name ) {
        res.json( '"error": "Movie name is not in json object"');
        return;
    }

    if( !req.body.year_released ) {
        res.json( '"error": "year released not found in json object"');
        return;
    }

    if( !req.body.actors ){
        res.json( '"error": "problem with actors in json object"');
        return;
    }

    var request = require( 'request' );
    var jsonBody = req.body;

    request( {
        url: 'http://api.usergrid.com/mattlamont/sandbox/movies',
        method: 'POST',
        headers: {"Content-Type" : "application/json" },
        body: JSON.stringify( jsonBody )
    } , function( error , response , body ) {
            if( error ){
                console.log( error );
            }
            console.log( body );
            res.json( body );

    });


}


function deleteMovie( req , res ) {
    var request = require( 'request' );

    var ql = req.swagger.params.ql.value;
    var query = 'http://api.usergrid.com/mattlamont/sandbox/movies?ql=';
    query += ql;

    console.log( 'Query: ' + query );

    request( {
        url: query,
        method: 'GET'
    } , function( error , response , body ) {
        if( !error && response.statusCode == 200 ) {
            var json = JSON.parse( body );
            var uuid = json.entities[0].uuid;
            var record_path = 'http://api.usergrid.com/mattlamont/sandbox/movies/';
            record_path += uuid;
            console.log( "Query: " + record_path );

            request({
                url: record_path,
                method: 'DELETE'
            } , function( err , resp , resp_body ){
                    if( !err && resp.statusCode == 200 ) {
                        res.json(resp_body);
                    }
                    console.log( "Error: " + err );
                    res.json( err );
            });

        }
        else{
            res.json( error );
        }
    });

}
