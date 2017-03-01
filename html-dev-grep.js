const readline = require('readline');
const fs = require('fs');
const path = require('path');
const htmlparser = require("htmlparser2");

const GROUP_INDICATOR = /<!--\s*group\s+([a-zA-Z]+[a-zA-Z0-9]*)\s*-->/;
const END_GROUP_INDICATOR = /<!--\s*\/group\s*-->/;

/**
 * The default indicator to recognize the begin of a group.
 * <code></code>
 * @constant
 * @type {RegExp}
 * @default <code>/&lt;!--\s*group\s+([a-zA-Z]+[a-zA-Z0-9]*)\s*--&gt;/</code>
 * */
module.exports.GROUP_INDICATOR = GROUP_INDICATOR;

/**
 * The default indicator to recognize the end of a group.
 * @constant
 * @type {RegExp}
 * @default <code>/&lt;!--\s*\/group\s*--&gt;/</code>
 * */
module.exports.END_GROUP_INDICATOR = END_GROUP_INDICATOR;

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
module.exports.groupScriptFile = function (fileName, done, error, opt) {
	var groupIndicator = opt ? (opt.token ? opt.token : GROUP_INDICATOR)
					: GROUP_INDICATOR;
	var groups = [];
	var currentBlock = "";
	var readingLine = 0;
	var inAGroup = false;
	if (fs.existsSync(fileName) && fs.statSync(fileName).isFile()) {
		const stream = fs.createReadStream(fileName);
		const rl = readline.createInterface({
			input: stream
		});

		rl.on('line', function (line) {
			var trimedLine = line.trim();
			++readingLine;
			if (trimedLine.match(groupIndicator)) {// start a new group
				if (inAGroup) {
					rl.close();//Stop reading
					if (typeof error === 'function') {
						error(new Error(`${readingLine}: group not match`));
					}
				}
				inAGroup = true;
				var groupName = groupIndicator.exec(trimedLine)[1];
				startNewGroup(groups, groupName, readingLine);
			} else if (trimedLine.match(END_GROUP_INDICATOR) && inAGroup) {
				inAGroup = false;
				setHtmlBlock(groups, currentBlock, readingLine);
				currentBlock = "";
			} else if (inAGroup) {
				currentBlock += trimedLine;
			}
		});

		rl.on('close', function () {
			if (typeof done === "function") {
				return done(groups);
			}
		});

	} else {
		throw new Error(`Cannot find path ${fileName} or it is not a file`);
	}
};

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
 * @param {object} groups an array of group, in which a new group is pushed. 
 * @param {string} groupName the name of the group.
 * @param {integer} startLine the start line  of the group in the being parsed html file.
 * */
var startNewGroup = function (groups, groupName, startLine) {
	var lastGroup = {'name': groupName, startLine: startLine, html: ''};
	console.log(`create new group named ${lastGroup.name}`);
	groups.push(lastGroup);
	return groups;
};

/**
 * @private
 * @param {object} groups 
 * @param {string} html
 * @param {integer} endLine  
 * */
var setHtmlBlock = function (groups, html, endLine) {
	var lastGroup = groups[groups.length - 1];
	if (html.length > 0) {
		lastGroup['endLine'] = endLine;
		lastGroup['html'] = html;
	} else {
		groups.pop();
	}
	return groups;
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
	g['js'] = [];
	g['css'] = [];
	var parser = new htmlparser.Parser({
		onopentag: function (name, attribs) {
			if (name === "script" && attribs.src) {
				g['js'].push(path.resolve(parentDir, attribs.src));
			}
			if (name === 'link'
							&& attribs.rel === 'stylesheet'
							&& attribs.href) {
				g['css'].push(path.resolve(parentDir, attribs.href));
			}
		},
		onclosetag: function (tagname) {
			//Nothing to do
		}
	}, {decodeEntities: true}
	);
	parser.write(g['html']);
	parser.end();
	return g;
};

