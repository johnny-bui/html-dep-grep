/* jshint node: true */
'use strict';

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



function GroupBlockLineConsumer (opt) {
	this.groups = [];
	this.currentBlock = "";
	this.readingLine = 0;
	this.inAGroup = false;
	this.opt = pickupOption(opt);
};



GroupBlockLineConsumer.prototype.consumeLine = function (line) {
	var trimedLine = line.trim();//assume default encoding is utf-8
	++this.readingLine;
	if (trimedLine.match(this.opt.token)) {// start a new group
		if (this.inAGroup) {
			throw new Error(`${this.readingLine}: group not match`);
		}
		this.inAGroup = true;
		var groupName = this.opt.token.exec(trimedLine)[1];
		startNewGroup(this.groups, groupName, this.readingLine);
	} else if (trimedLine.match(this.opt.endToken) && this.inAGroup) {
		this.inAGroup = false;
		setHtmlBlock(this.groups, this.currentBlock, this.readingLine);
		this.currentBlock = "";
	} else if (this.inAGroup) {
		this.currentBlock += trimedLine;
	}
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
		lastGroup.endLine = endLine;
		lastGroup.html = html;
	} else {
		groups.pop();
	}
	return groups;
};

module.exports.GroupBlockLineConsumer = GroupBlockLineConsumer;


////////////////////////////////////////////////////////////////////////////////


var FileReplaceLines= function(fileName, originGroup, replacementGroup){
	this.fileName = fileName;
	this.originGroups = originGroup;
	this.replacementGroup = replacementGroup || [];
	this.buffer = "";
	this.readingLine = 0;
	this.currentBlockIdx = 0;//the first block index is 0
	this.currentGroup = null;
	this.outOfBlock = true;
};

FileReplaceLines.prototype.consumeLine = function(line){
	++this.readingLine;
	if (this.originGroups.length > this.currentBlockIdx){
		this.currentGroup = this.originGroups[this.currentBlockIdx];
		//out of a block
		if (this.readingLine <= this.currentGroup.startLine && this.outOfBlock){
			this.buffer += line + "\n";
		}
		//enter a new block
		if (this.readingLine === this.currentGroup.startLine){
			this.outOfBlock = false;
			
		}
		//Reach the last line of the current group
		if (this.readingLine === this.currentGroup.endLine){
			this.buffer += (this.replacementGroup.length > this.currentBlockIdx ?
										this.replacementGroup[this.currentBlockIdx] :
										"<!-- empty replacement -->" ) + "\n";
			this.buffer += line + "\n";
			++this.currentBlockIdx;
			this.outOfBlock = true;
		}
	}else{
		this.buffer += line + "\n";
	}
};

module.exports.FileReplaceLines = FileReplaceLines;



var pickupOption = function (opt) {
	return {
		token: (opt ? (opt.token ? opt.token : GROUP_INDICATOR)
						: GROUP_INDICATOR),
		endToken: (opt ? (opt.endToken ? opt.endToken : END_GROUP_INDICATOR)
						: END_GROUP_INDICATOR),
		encoding: (opt ? (opt.encoding ? opt.encoding : 'utf-8')
						: 'utf-8')
	};
};


module.exports.pickupOption = pickupOption;