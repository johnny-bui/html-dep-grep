/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var rewire = require("rewire");
var assert = require('assert'),
		htmlGrep = rewire('../html-dev-grep');
		
describe('#htmlGrep', function() {
  it('groups script tag array', function() {
    var fileName = "test/test.html";
		var g = [];
		htmlGrep.groupScriptFile(fileName, function(group){
			g = group;
			assert(g.length > 0);
			console.log(g);
		});
		
  });
});

describe('GROUP_INDICATOR', function(){
	it('matches with both spacing',function(){
		assert("<!-- group -->".match(htmlGrep.GROUP_INDICATOR));
		assert("<!-- /group -->".match(htmlGrep.END_GROUP_INDICATOR));
	});
});

describe('GROUP_INDICATOR', function(){
	it('matches with left spacing',function(){
		assert("<!--   group-->".match(htmlGrep.GROUP_INDICATOR));
		assert("<!--   /group-->".match(htmlGrep.END_GROUP_INDICATOR));
	});
});

describe('GROUP_INDICATOR', function(){
	it('matches with right spacing',function(){
		assert("<!--group  -->".match(htmlGrep.GROUP_INDICATOR));
		assert("<!--/group  -->".match(htmlGrep.END_GROUP_INDICATOR));
	});
});