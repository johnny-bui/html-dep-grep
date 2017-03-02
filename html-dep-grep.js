const readline = require('readline');
const fs = require('fs');
const path = require('path');
const htmlparser = require("htmlparser2");

const LineByLine = require('n-readlines');//for reading big file

const htmlConsumer = require('./html-consumer');

/**
 * @param {string} fileName 
 * @param {function} done function with one argument, which is 
 * called after parsing the html file finishes. The arugment of the function is an
 * object like:
 * <pre><code>[{'name': <given name>,
 *   'startLine': <line>, 'endLine': <line>,
 *   'html': "html code goes here"
 *	}, .... ]</code></pre>
 *	Write your own function to handle the group.
 * @param {function} error a callback function to handel error by reading file. It 
 * is a function expecting only one argument als error message. Write your own
 * function. 
 * @param {object} opt optinal argument, default is an undefined object (TODO: document).
 */
module.exports.grepDepFile = function (fileName, done, error, opt) {

	var consumer = new htmlConsumer.GroupBlockLineConsumer(opt);
	//Override the default implement.
	if (typeof done === 'function'){
		consumer.done = function(){
			done(consumer.groups);
		};
	}
	
	readFileLineByLine(fileName, consumer, error);
	
};

/**
 * Synchrone Version of @link #grepDepFile.
 * @param {string} fileName the file name
 * @param {object} opt option.
 * @returns {array} the array of group, each element is an object like
 * <pre></code>{
 *    "name": groupName,
 *    "startLine": startLine,
 *    "endLine": endLine,
 *    "html": html
 * }</code></pre>
 * */
module.exports.grepDepFileSync = function (fileName, opt) {
	var effectivOption = htmlConsumer.pickupOption(opt);
	
	if (fs.existsSync(fileName) && fs.statSync(fileName).isFile()) {
		var liner = new LineByLine(fileName);
		var consumer = new htmlConsumer.GroupBlockLineConsumer(opt);
		while ((line = liner.next()) && line) {
			var strLine = line.toString(effectivOption.encoding);
			consumer.consumeLine(strLine);
		}
		return consumer.groups;
	} else {
		throw new Error(`Cannot find path ${fileName} or it is not a file`);
	}
};

/**
 * @param {string} fileName the file name. 
 * @param {GroupBlockLineConsumer} lineConsumer 
 * @param {function} error is called if an error happends by consuming 
 * the line. 
 * */
var readFileLineByLine = function(fileName, lineConsumer, error){
	if (fs.existsSync(fileName) && fs.statSync(fileName).isFile()) {
		const stream = fs.createReadStream(fileName);
		const rl = readline.createInterface({
			input: stream
		});
		
		rl.on('line', function (line) {
			try{
				lineConsumer.consumeLine(line);
			}catch(ex){
				rl.close();
				error(ex);
			}
		});

		rl.on('close', function () {
			lineConsumer.done();
		});

	} else {
		throw new Error(`Cannot find path ${fileName} or it is not a file`);
	}
};

// module.exports.readFileLineByLine = readFileLineByLine;



/**
 * resolve path of files in each group, this function creates for each
 * group `g` in `groups` a new array attribute `js`, which contains the resolved
 * path of the javascript, and a new array attribute `css`, for CSS files.
 * 
 * @param {string} fileName the file name of the HTML file. 
 * @param {array} groups an array of Element like 
 * <pre><code>{"name":"the group name", 
 * "startLine": startLine, "endLine": endLine,
 * "html": "html code snippet, only script and link tag are recognized"}</code>
 * </pre>
 * */
module.exports.resolvePath = function (fileName, groups) {
	for (i = 0; i < groups.length; ++i) {
		g = groups[i];
		parseSnippet(g, fileName);
	}
	return groups;//for chain-call
};



/**
 * @private
 * @param {object} g an Object like 
 * <pre><code>{'name':'sowieso','html':'html code', 
 * 'startLine':<int>, 'endLine':'<int>'}</code></pre>
 * @param {string} fileName the html filename 
 * */
var parseSnippet = function (g, fileName) {
	const parentDir = path.dirname(fileName);
	g.js = [];
	g.css = [];
	var parser = new htmlparser.Parser({
		onopentag: function (name, attribs) {
			if (name === "script" && attribs.src) {
				g.js.push(path.resolve(parentDir, attribs.src));
			}
			if (name === 'link'	&& 
					attribs.rel === 'stylesheet' && 
					attribs.href) {
				g.css.push(path.resolve(parentDir, attribs.href));
			}
		},
		onclosetag: function (tagname) {
			//Nothing to do
		}
	}, {decodeEntities: true}
	);
	parser.write(g.html);
	parser.end();
	return g;
};



