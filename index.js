#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const htmlGrep = require('./html-dev-grep');

var program = require('commander');

var fileName = null;
program
	.version('0.0.1')
	.arguments('<file>')
	//.option('-u, --username <username>', 'The user to authenticate as')
	//.option('-p, --password <password>', 'The user\'s password')
	.action(function(file) {
		console.log('file: %s', file);
		fileName = file;
	})
	.parse(process.argv);


var done = function(group){
	var grepTag = htmlGrep.grepTag(fileName, group);
	console.log(group);
};
htmlGrep.groupScriptFile(fileName, done);
