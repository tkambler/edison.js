define(function(require) {

	var _ = require('underscore'),
		MicroEvent = require('./microevent');

	/**
	 * @class Router
	 */
	var Router = function(edison) {
		this.init.apply(this, _.toArray(arguments));
		/*
		return {
			'bind': this.bind.apply(this)
		};
		*/
	};

	MicroEvent.mixin(Router.prototype);

	_.extend(Router.prototype, {

		'edison': null,

		'listening': false,

		'init': function(edison) {
			this.edison = edison;
		},

		'listen': function() {
			var self = this;
			if ( this.listening ) {
				return;
			}
			this.listening = true;
			this.bind('hash_change', function(data) {
				self.onHashChange(data);
			});
			this.watchURL();
		},

		'watchURL': function() {
			window.onhashchange = this.processHashChange.bind(this);
			if ( window.location.hash ) {
				this.processHashChange();
			}
		},

		'processHashChange': function() {
			this.trigger('hash_change', {
				'hash': window.location.hash
			});
		},

		'onHashChange': function(data) {
			var processed;
			data = data || {};
			_.defaults(data, {
				'hash': null
			});
			if ( !data.hash ) {
				return;
			}
			try {
				processed = this.processHash(data.hash);
			} catch(e) {
				return;
			}
			this.trigger('on_route', processed);
		},

		'processHash': function(hash) {
			if ( hash.indexOf('#') === 0 && hash.indexOf('!') === 1 ) {
				hash = hash.substring(2);
			}
			if ( hash === '' ) {
				throw 'Invalid hash.';
			}
			var address = null,
				tmp = hash.split('?'),
				section_name = null,
				route_name = null,
				route_id = null;
			if ( tmp.length === 1 ) {
				address = tmp.pop();
			} else {
				address = tmp.shift();
			}
			if ( address.indexOf('/') < 0 ) {
				section_name = address;
			} else {
				tmp = address.split('/');
				switch ( tmp.length ) {
					case 1:
						section_name = tmp.pop();
						break;
					case 2:
						section_name = tmp.shift();
						route_name = tmp.shift();
						break;
					case 3:
						section_name = tmp.shift();
						route_name = tmp.shift();
						route_id = tmp.shift();
						break;
				}
			}
			var params = {};
			return {
				'section_name': section_name,
				'route_name': route_name,
				'route_id': route_id
			};
		}

	});

	return Router;

});
