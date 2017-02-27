const readline = require('readline');
const fs = require('fs');
const htmlGrep = require('./html-dev-grep');
var fileName = "test/test.html";
var done = function(group){
	console.log(group);
	var grepTag = htmlGrep.grepTag(fileName, group);
	console.log(group);
};
htmlGrep.groupScriptFile(fileName, done);
