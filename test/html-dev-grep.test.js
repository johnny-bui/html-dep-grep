var rewire = require("rewire");
var assert = require('assert'),
		htmlGrep = rewire('../html-dev-grep');
		
describe('#htmlGrep', function() {
  it('groups script tag to array', function(fn) {
    var fileName = "test/test.html";
		htmlGrep.groupScriptFile(fileName, function(groups){
			const numOfGroup = 3;
			if (groups.length === numOfGroup){
				fn();
			}else{
				fn(new Error(`expected ${numOfGroup} but was ${groups.length}`));
			};
		});
  });
});

describe('#htmlGrep', function() {
  it('recognizes name in group mark', function(fn) {
    var fileName = "test/test.html";
		htmlGrep.groupScriptFile(fileName, function(groups){
			
			const nameOne = 'one', nameTwo = 'two2';
			if (groups[1].name === nameOne ){
				if (groups[2].name === nameTwo ){
					fn();
				}else{
					fn(new Error(`expected ${nameTwo} but was ${groups[1].name}`));
				}
			}else{
				fn(new Error(`expected ${nameOne} but was ${groups[0].name}`));
			};
		});
  });
});

describe('#htmlGrep', function() {
  it('recognizes name in group mark', function(fn) {
    var fileName = "test/test.html";
		htmlGrep.groupScriptFile(fileName, function(groups){
			
			const nameOne = 'one', nameTwo = 'two2';
			if (groups[1].name === nameOne ){
				if (groups[2].name === nameTwo ){
					fn();
				}else{
					fn(new Error(`expected ${nameTwo} but was ${groups[1].name}`));
				}
			}else{
				fn(new Error(`expected ${nameOne} but was ${groups[0].name}`));
			};
		});
  });
});

describe('#htmlGrep', function() {
  it('throws exception when groups do not match', function(fn) {
    var fileName = "test/invalid-group.html";
		try{
			htmlGrep.groupScriptFile(fileName, function(){}, function(err){
				if (err){
					console.log(err);
					fn();
				}else{
					fn(new Error('expected an exception'));
				}
			});
		}catch(e){
			//TODO: write assert for exception here
			console.log(e);
		}
  });
});

describe('#grepTag', function() {
  it('parsers scripts into js', function() {
			var fileName = "test/not-exist.html";
			try{
				htmlGrep.groupScriptFile(fileName, function(){
					//Nothing to do
				});
				assert.fail("Expected an exception");
			}catch(e){
				//TODO: write assert about e
				console.log(e);
			}
	});
});

describe('#grepTag', function() {
  it('parsers link into css', function(fn) {
		
    var fileName = "test/test.html";
		var done = function(groups){
			htmlGrep.grepTag(fileName, groups);
			var gLink = groups[0];
			const linkLength = 1;
			if(gLink.css.length === linkLength){
				fn();
			}else{
				fn(new Error(`Expected ${linkLength} but was ${gLink.length}` ));
			}
		};
		htmlGrep.groupScriptFile(fileName, done);
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