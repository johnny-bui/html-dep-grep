var rewire = require("rewire");
var assert = require('assert'),
				htmlGrep = rewire('../html-dev-grep');

describe('#htmlGrep.grepDepFile', function () {
	it('groups script tag to array', function (fn) {
		var fileName = "test/test.html";
		htmlGrep.grepDepFile(fileName, function (groups) {
			const numOfGroup = 3;
			if (groups.length === numOfGroup) {
				fn();
			} else {
				fn(new Error(`expected ${numOfGroup} but was ${groups.length}`));
			}
			;
		});
	});
});


describe('#htmlGrep.grepDepFile', function () {
	it('recognizes name in group mark', function (fn) {
		var fileName = "test/test.html";
		htmlGrep.grepDepFile(fileName, function (groups) {

			const nameOne = 'one', nameTwo = 'two2';
			if (groups[1].name === nameOne) {
				if (groups[2].name === nameTwo) {
					fn();
				} else {
					fn(new Error(`expected ${nameTwo} but was ${groups[2].name}`));
				}
			} else {
				fn(new Error(`expected ${nameOne} but was ${groups[1].name}`));
			}
			;
		});
	});
});

describe('#htmlGrep.grepDepFile', function () {
	it('recognizes start and end lines at the mark point', function (fn) {
		var fileName = "test/test.html";
		htmlGrep.grepDepFile(fileName, function (groups) {
			// the first script-block
			const startLineOne = 21, endLineOne = 26,
							startLineTwo = 31, endLineTwo = 37;

			if (groups[1].startLine === startLineOne && groups[1].endLine === endLineOne) {
				if (groups[2].startLine === startLineTwo && groups[2].endLine === endLineTwo) {
					fn();
				} else {
					fn(new Error(`expected (${startLineTwo},${endLineTwo}) but was (${groups[2].startLine},${groups[2].endLineLine})`));
				}
			} else {
				fn(new Error(`expected (${startLineOne},${endLineOne}) but was (${groups[1].startLine},${groups[1].endLineLine})`));
			}
			;
		});
	});
});



describe('#htmlGrep.grepDepFile', function () {
	it('throws exception when groups do not match', function (fn) {
		var fileName = "test/invalid-group.html";
		try {
			htmlGrep.grepDepFile(fileName, function () {}, function (err) {
				if (err) {
					console.log(err);
					fn();
				} else {
					fn(new Error('expected an exception'));
				}
			});
		} catch (e) {
			//TODO: write assert for exception here
			console.log(e);
		}
	});
});


describe('#grepTag', function () {
	it('parsers scripts into js', function () {
		var fileName = "test/not-exist.html";
		try {
			htmlGrep.grepDepFile(fileName, function () {
				//Nothing to do
			});
			assert.fail("Expected an exception");
		} catch (e) {
			//TODO: write assert about e
			console.log(e);
		}
	});
});

describe('#grepTag', function () {
	it('parsers link into css', function (fn) {

		var fileName = "test/test.html";
		var done = function (groups) {
			htmlGrep.resolvePath(fileName, groups);
			var gLink = groups[0];
			const linkLength = 1;
			if (gLink.css.length === linkLength) {
				fn();
			} else {
				fn(new Error(`Expected ${linkLength} but was ${gLink.length}`));
			}
		};
		htmlGrep.grepDepFile(fileName, done);
	});

});

////////////////////////////////////////////////////////////////////////////////

describe('#htmlGrep.grepDepFileSync', function () {
	it('groups script tag to array', function () {
		var fileName = "test/test.html";
		const numOfGroup = 3;
		var groups = htmlGrep.grepDepFileSync(fileName);
		assert.equal(groups.length, numOfGroup);
	});
});



describe('#htmlGrep.grepDepFileSync', function () {
	it('recognizes name in group mark', function () {
		var fileName = "test/test.html";
		var groups = htmlGrep.grepDepFileSync(fileName);

		const nameOne = 'one', nameTwo = 'two2';
		if (groups[1].name === nameOne) {
			if (groups[2].name === nameTwo) {
				//OK
			} else {
				throw new Error(`expected ${nameTwo} but was ${groups[1].name}`);
			}
		} else {
			throw new Error(`expected ${nameOne} but was ${groups[0].name}`);
		}
	}
	);
});


describe('#htmlGrep.grepDepFileSync', function () {
	it('recognizes start and end lines at the mark point', function () {
		var fileName = "test/test.html";
		var groups = htmlGrep.grepDepFileSync(fileName);
		// the first script-block
		const startLineOne = 21, endLineOne = 26,
						startLineTwo = 31, endLineTwo = 37;

		if (groups[1].startLine === startLineOne && groups[1].endLine === endLineOne) {
			if (groups[2].startLine === startLineTwo && groups[2].endLine === endLineTwo) {
				//OK
			} else {
				throw new Error(`expected (${startLineTwo},${endLineTwo}) but was (${groups[2].startLine},${groups[2].endLineLine})`);
			}
		} else {
			throw new Error(`expected (${startLineOne},${endLineOne}) but was (${groups[1].startLine},${groups[1].endLineLine})`);
		}

	});
});



describe('#htmlGrep.grepDepFileSync', function () {
	it('throws exception when groups do not match', function () {
		var fileName = "test/invalid-group.html";
		try {
			htmlGrep.grepDepFileSync(fileName);
			assert.fail("Expected an exception");
		} catch (e) {
			//TODO: write assert for exception here
			console.log(e);
		}
	});
});





describe('GROUP_INDICATOR', function () {
	it('matches with both spacing', function () {
		assert("<!-- group a -->".match(htmlGrep.GROUP_INDICATOR));
		assert("<!-- /group -->".match(htmlGrep.END_GROUP_INDICATOR));
	});
});

describe('GROUP_INDICATOR', function () {
	it('picks up the alphabetical name part', function () {
		var name = htmlGrep.GROUP_INDICATOR.exec("<!-- group abcde -->")[1];
		assert.equal(name, "abcde");
	});
});

describe('GROUP_INDICATOR', function () {
	it('picks up the numeric-alphabetical name part', function () {
		var name = htmlGrep.GROUP_INDICATOR.exec("<!-- group c3p0 -->")[1];
		assert.equal(name, "c3p0");
	});
});

describe('GROUP_INDICATOR', function () {
	it('matches with left spacing', function () {
		assert("<!--   group  a2-->".match(htmlGrep.GROUP_INDICATOR));
		assert("<!--   /group-->".match(htmlGrep.END_GROUP_INDICATOR));
	});
});

describe('GROUP_INDICATOR', function () {
	it('matches with right spacing', function () {
		assert("<!--group aB1 -->".match(htmlGrep.GROUP_INDICATOR));
		assert("<!--/group  -->".match(htmlGrep.END_GROUP_INDICATOR));
	});
});

describe('GROUP_INDICATOR', function () {
	it('matches with right spacing', function () {
		assert.ok(!("<!--group _aB1 -->".match(htmlGrep.GROUP_INDICATOR)));

	});
});