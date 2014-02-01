define(function(require) {

	var _ = require('underscore'),
		MicroEvent = require('./microevent');

	var Sandbox = function(route) {
		this.route = route;
	};

	_.extend(Sandbox.prototype, {

		'get': function(name) {
			name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(window.location.hash);
			return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
		}

	});

	MicroEvent.mixin(Sandbox.prototype);

	return Sandbox;

});
