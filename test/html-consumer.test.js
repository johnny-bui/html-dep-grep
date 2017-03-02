var rewire = require("rewire");
var assert = require('assert'),
				htmlConsumer = rewire('../html-consumer');

const html_code =
`<!DOCTYPE html>

<html>
	<head>
		<title>TODO supply a title</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<script src="dummy/group">
			
		</script>
		<!-- group link -->
		<link rel="stylesheet" type="text/css" href="so/wie/so.css" />
		<!-- /group -->
	</head>
	<body>
		<div>TODO write content</div>
		<!-- group one -->
		<script src="what/the/hell.js"></script>
		<script src="something/wrong.js">
			
		</script>
		<!-- /group -->
		
		<!-- group empty1 -->
		<!-- /group -->
		
		<!-- group two2 -->
		<script src="/other/group.js">
			
		</script>
		<script src="../upps/what/happen.js?question=null"></script>
		<script src="./xxx"></script>
		<!-- /group -->
		
		<!-- group empty2 -->
		<!-- /group -->
	</body>
</html>
`;

const groups = [
	{startLine: 17, endLine: 22},
	{startLine: 27, endLine: 33}
];

const replacement = [
	"<script src=\"test-replacement-one.js\"></script>",
	"<script src=\"test-replacement-two.js\"></script>"
];

describe('#FileReplaceLines.consumeLine', function () {
	it('append none-replacement file to buffer', function () {
		var replacer = new htmlConsumer.FileReplaceLines('test.html',groups,replacement);
		var lines = html_code.split("\n");
		for(var i = 0; i < lines.length; ++i){
			replacer.consumeLine(lines[i]);
		}
		var replaced = replacer.buffer.split("\n");
		assert.equal(replaced[ groups[0].startLine  ], replacement[0]);
		var offset = groups[0].endLine - groups[0].startLine - 2 ;// 2 === 2 lines of the last group (the <!-- group xxx --> not counted)
		assert.equal(replaced[ groups[1].startLine - offset], replacement[1]);
	});
});



describe('GROUP_INDICATOR', function () {
	it('matches with both spacing', function () {
		assert("<!-- group a -->".match(htmlConsumer.GROUP_INDICATOR));
		assert("<!-- /group -->".match(htmlConsumer.END_GROUP_INDICATOR));
	});
});

describe('GROUP_INDICATOR', function () {
	it('picks up the alphabetical name part', function () {
		var name = htmlConsumer.GROUP_INDICATOR.exec("<!-- group abcde -->")[1];
		assert.equal(name, "abcde");
	});
});

describe('GROUP_INDICATOR', function () {
	it('picks up the numeric-alphabetical name part', function () {
		var name = htmlConsumer.GROUP_INDICATOR.exec("<!-- group c3p0 -->")[1];
		assert.equal(name, "c3p0");
	});
});

describe('GROUP_INDICATOR', function () {
	it('matches with left spacing', function () {
		assert("<!--   group  a2-->".match(htmlConsumer.GROUP_INDICATOR));
		assert("<!--   /group-->".match(htmlConsumer.END_GROUP_INDICATOR));
	});
});

describe('GROUP_INDICATOR', function () {
	it('matches with right spacing', function () {
		assert("<!--group aB1 -->".match(htmlConsumer.GROUP_INDICATOR));
		assert("<!--/group  -->".match(htmlConsumer.END_GROUP_INDICATOR));
	});
});

describe('GROUP_INDICATOR', function () {
	it('matches with right spacing', function () {
		assert.ok(!("<!--group _aB1 -->".match(htmlConsumer.GROUP_INDICATOR)));

	});
});