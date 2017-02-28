#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const htmlGrep = require('./html-dev-grep');

var program = require('commander');

var fileName = null;
program
	.version('0.0.1')
	.arguments('<file>')
	.action(function(file) {
		console.log('file: %s', file);
		fileName = file;
	})
	.parse(process.argv);


var done = function(group){
	var grepTag = htmlGrep.grepTag(fileName, group);
	//console.log(group);
	printDependency(fileName, group);
};

var printDependency = function(fileName, group){
	var i = 0, 
			j = 0, 
			g; 
	process.stdout.write(`${fileName}\n`);
	for (i = 0; i < group.length; ++i){
		g = group[i];
		process.stdout.write(`    ${g.name}\n`);
		for (j = 0; j < g.js.length; ++j){
			process.stdout.write(`        ${g.js[j]}\n`);
		}
		for (j = 0; j < g.css.length; ++j){
			process.stdout.write(`        ${g.css[j]}\n`);
		}
	}
};
htmlGrep.groupScriptFile(fileName, done);


