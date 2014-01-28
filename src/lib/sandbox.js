define(function(require) {

	var _ = require('underscore'),
		MicroEvent = require('./microevent');

	var Sandbox = function(route) {
		this.route = route;
	};

	_.extend(Sandbox.prototype, {

		'get': function(key) {
			return this.route.getParameters[key];
		},

		'getAll': function() {
			return this.route.getParameters;
		},

		'request': function(method, post, callback) {
			var url = '/' + this.route.section.getController() + '/' + method;
			$.post(url, post, function(result) {
				callback(result);
			}, 'json');
		},

		'setInterval': function(fn, interval) {
			Router.createSectionInterval(fn, interval);
		},

		'getTemplate': function(tpl_name) {
			if ( _.empty(tpl_name) ) {
				throw 'You must specify a template name.';
			}
			var tpl_selector = "#rtpl_" + tpl_name;
			if ( $(tpl_selector).size() === 1 ) {
				var text = $(tpl_selector).html();
				return Handlebars.compile(text);
			} else {
				throw 'Could not locate specified template: ' + tpl_name;
			}
		},

		'getQuery': function(name) {
			name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
			return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
		}

	});

	MicroEvent.mixin(Sandbox.prototype);

	return Sandbox;

});
