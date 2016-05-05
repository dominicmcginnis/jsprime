/**
 * Get a list of files and pass their contents for analysis
 *
 * Requires to pass in a directory where the files are located
 * 
 */

var querystring = require('querystring'),
	esprima = require('esprima'),
	engine = require('./engine.js'),
	analyzer = require('./analyzer.js'),
    events = require('events'),
    util = require('util'),
	fs = require('fs'),
 	dir = require('node-dir');

var __dirname = process.argv[2];

var resultFile = fs.createWriteStream(__dirname + '/result.html', {flags : 'w'});

/**
 * Mock https.serverResponse
 * @type {Object}
 */
Eventer = function(){
	events.EventEmitter.call(this);

	this.data = '';

	this.onData = function(){
		this.emit('data', this.data);
	}

	this.setEncoding = function(){

	}
	this.write = function(data) {
		resultFile.write(util.format(data) + '\n');
	}
	this.onEnd = function(data){
		this.emit('end', this.data);
	}
};
util.inherits(Eventer, events.EventEmitter);

function processFile(filecontent) {
	var code = filecontent;
	var options = {
		loc: true,
		comment: false,
		raw: false,
		range: false,
		tolerant: false
	};

	util.inherits(Eventer, events.EventEmitter);
	var mockResponse = new Eventer();

	var result = esprima.parse(code, options);
	var str_result = JSON.stringify(result, null, 4);
	engine.analyze(str_result);
	engine.asignFunctionReturnValue(analyzer.sink);
	analyzer.analyzeArrays(engine.real_func_names, engine.real_func_call, engine.real_variable_const, engine.real_variable_var, engine.real_variable_obj, engine.startScope, engine.endScope, code, mockResponse);

}

resultFile.write(util.format("<html><body>") + '\n');

dir.readFiles(__dirname, { 
    	match: /.js$/,    	
    	exclude: /^\./
    },
    function(err, content, next) {
        if (err) throw err;
        processFile(content);
        //console.log('content:', content);
        next();
    },
    function(err, files){
        if (err) throw err;
     //   console.log('finished reading files:', files);
    });

/*
Look to extract JS from html files for examination...
dir.readFiles(__dirname, { 
    	match: /.html$/,    	
    	exclude: /^\./
    },
    function(err, content, next) {
        if (err) throw err;
        processFile(content);
        //console.log('content:', content);
        next();
    },
    function(err, files){
        if (err) throw err;
     //   console.log('finished reading files:', files);
    });
*/
resultFile.write(util.format("</body></html>") + '\n');

