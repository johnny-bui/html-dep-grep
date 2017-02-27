/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var rewire = require("rewire");
var assert = require('assert'),
		htmlGrep = rewire('../html-dev-grep');
		
describe('#htmlGrep', function() {
  it('groups script tag to array', function(fn) {
    var fileName = "test/test.html";
		htmlGrep.groupScriptFile(fileName, function(groups){
			console.log(groups);
			const numOfGroup = 2;
			if (groups.length === numOfGroup){
				fn();
			}else{
				fn(new Error(`expected ${numOfGroup} but was ${groups.length}`));
			};
		});
  });
});

describe('GROUP_INDICATOR', function(){
	it('matches with both spacing',function(){
		assert("<!-- group a -->".match(htmlGrep.GROUP_INDICATOR));
		assert("<!-- /group -->".match(htmlGrep.END_GROUP_INDICATOR));
	});
});

describe('GROUP_INDICATOR', function(){
	it('picks up the alphabetical name part',function(){
		var name = htmlGrep.GROUP_INDICATOR.exec("<!-- group abcde -->")[1];
		assert.equal(name,"abcde");
	});
});

describe('GROUP_INDICATOR', function(){
	it('picks up the numeric-alphabetical name part',function(){
		var name = htmlGrep.GROUP_INDICATOR.exec("<!-- group c3p0 -->")[1];
		assert.equal(name,"c3p0");
	});
});

describe('GROUP_INDICATOR', function(){
	it('matches with left spacing',function(){
		assert("<!--   group  a2-->".match(htmlGrep.GROUP_INDICATOR));
		assert("<!--   /group-->".match(htmlGrep.END_GROUP_INDICATOR));
	});
});

describe('GROUP_INDICATOR', function(){
	it('matches with right spacing',function(){
		assert("<!--group aB1 -->".match(htmlGrep.GROUP_INDICATOR));
		assert("<!--/group  -->".match(htmlGrep.END_GROUP_INDICATOR));
	});
});

describe('GROUP_INDICATOR', function(){
	it('matches with right spacing',function(){
		assert.ok(! ("<!--group _aB1 -->".match(htmlGrep.GROUP_INDICATOR)) );
		
	});
});