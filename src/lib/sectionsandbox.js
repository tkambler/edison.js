define(function(require) {

	var _ = require('underscore');

	var SectionSandbox = function(section) {
		this.section = section;
	};

	_.extend(SectionSandbox.prototype, {

		'setInterval': function(fn, interval) {
			this.edison.createParentSectionInterval(fn, interval);
		},

		'request': function(method, post, callback) {
			var url = '/' + this.controller + '/' + method;
			$.post(url, post, function(result) {
				callback(result);
			}, 'json');
		}

	});

	return SectionSandbox;

});
