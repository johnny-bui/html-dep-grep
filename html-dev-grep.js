const readline = require('readline');
const fs = require('fs');
const path = require('path');
const htmlparser = require("htmlparser2");

const GROUP_INDICATOR = /<!--\s*group\s+([a-zA-Z]+[a-zA-Z0-9]*)\s*-->/;
const END_GROUP_INDICATOR = /<!--\s*\/group\s*-->/
const GLOBAL_NAME = "__global";

module.exports = {
	
	GROUP_INDICATOR: GROUP_INDICATOR,
	END_GROUP_INDICATOR : END_GROUP_INDICATOR,
	/**
	 * @param {string} fileName 
	 * @param {function} done function with one argument, which is 
	 * called after parsing the html file finish. The arugment of the function is an
	 * object like 
	 * `[{'name': <given name>,
	 *   'startLine': <line>, 'endLine': <line>,
	 *   'html': <html>
	 *	}, .... ]`
	 *	
	 * @param {object} opt (TODO: document)
	 */
	groupScriptFile: function (fileName, done, opt) {
		var groupIndicator = opt ? (opt.token ? opt.token : GROUP_INDICATOR)
						: GROUP_INDICATOR;
		var groups = [
			{"name":"__global", html:""}
		];
		var currentBlock = "";
		var readingLine = 0;
		var inAGroup = false;
		if (fs.existsSync(fileName) && fs.statSync(fileName).isFile() ) {
			const rl = readline.createInterface({
				input: fs.createReadStream(fileName)
			});

			rl.on('line', function(line) {
				var trimedLine = line.trim();
				++readingLine;
				if (trimedLine.match(groupIndicator)){// start a new group
					inAGroup = true;
					var groupName = groupIndicator.exec(trimedLine)[1];
					startNewGroup(groups, groupName, readingLine);
				}else if( trimedLine.match(END_GROUP_INDICATOR) && inAGroup ){
					inAGroup = false;
					setHtmlBlock(groups, currentBlock, readingLine);
					currentBlock = "";
				}else if (inAGroup){
					currentBlock += trimedLine;
				}
			});

			rl.on('close', function(){
				if(typeof done === "function"){
					done(groups);
				}
			});
		}else {
			throw new Error(`Cannot find path ${fileName} or it is not a file`);
		}
	},
	'grepTag': function(fileName, groups){
			for (i = 0; i < groups.length; ++i){
			g = groups[i];
			parseSnippet(g, fileName);
		}
	}
};

var startNewGroup = function(groups, groupName, startLine){
	var lastGroup = groups.length > 0 
						? groups[groups.length-1] 
						: undefined ;
	if (lastGroup && lastGroup["html"].length === 0){
		console.log(`group ${lastGroup.name} is empty, remove it!`);
		groups.pop();	
	}
	
	lastGroup = {'name':groupName, statLine:startLine, html:''};
	console.log(`create new group named ${lastGroup.name}`);
	groups.push(lastGroup);
	return groups;
};

var setHtmlBlock = function(groups, html, endLine){
	var lastGroup = groups[groups.length-1] ;
	lastGroup['endLine'] = endLine;
	lastGroup['html'] = html;
	return groups;
};


/**
 * @param {object} g an Object like 
 * {'name':'sowieso','html':'html code', 
 * 'startLine':<int>, 'endLine':'<int>'}
 * @param {string} fileName the html filename 
 * */
var parseSnippet = function(g,fileName){
	const parentDir = path.dirname(fileName);
	g['js'] = [];
	g['css'] = [];
	var parser = new htmlparser.Parser({
    onopentag: function(name, attribs){
        if(name === "script" && attribs.src){
            g['js'].push( path.resolve(parentDir, attribs.src) );
        }else if (name === 'link' 
								&& attribs.rel === 'stylesheet' 
								&& attribs.href ){
					g['css'].push( path.resolve(parentDir, attribs.href) );
				}
    },
    ontext: function(text){
        
    },
    onclosetag: function(tagname){
        
    }
		}, {decodeEntities: true}
	);
	parser.write(g['html']);
	parser.end();
	return g;
};

