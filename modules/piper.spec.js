var assert = require('assert');
var transcoder = require('transcoder');

describe('Transcoder', function() {
	describe('#play()', function() {
		it('should return -1 when the value is not present', function() {
			assert.equal(-1, [1, 2, 3].indexOf(5));
			assert.equal(-1, [1, 2, 3].indexOf(0));
		});
	});
});