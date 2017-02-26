const readline = require('readline');
const fs = require('fs');

const GROUP_INDICATOR = /<!--\s*group\s*-->/;
const END_GROUP_INDICATOR = /<!--\s*\/group\s*-->/
module.exports = {
	/**
	 * @param {string} fileName 
	 * @param {object} opt 
	 */
	GROUP_INDICATOR: GROUP_INDICATOR,
	END_GROUP_INDICATOR : END_GROUP_INDICATOR,
	groupScriptFile: function (fileName, done, opt) {
		var groupIndicator = opt ? (opt.token ? opt.token : GROUP_INDICATOR)
						: GROUP_INDICATOR;
		var groups = [];
		var currentBlock = "";
		var inAGroup = false;
		if (fs.existsSync(fileName) && fs.statSync(fileName).isFile() ) {
			const rl = readline.createInterface({
				input: fs.createReadStream(fileName)
			});

			rl.on('line', (line) => {
				var trimedLine = line.trim();
				if (trimedLine.match(groupIndicator)){// start a new group
					inAGroup = true;
				}else if( trimedLine.match(END_GROUP_INDICATOR) && inAGroup ){
					inAGroup = false;
					groups.push(currentBlock);
					currentBlock = "";
				}else if (inAGroup){
					//TODO: parse script tags
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
	}
};


