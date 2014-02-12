define(function(require) {

	var _ = require('underscore'),
		Route = require('./route'),
		Sandbox = require('./sandbox');

	/**
	 * @class Section
	 */
	var Section = function(options, edison) {

		var self = this;
		self.edison = edison;
		self.name = options.name;
		self.controller = options.controller;
		self.callback = options.callback;
		self.extensions = options.extend;
		self.parent_section = options.parent_section;
		self.template = options.template;
		self.templateData = options.templateData;
		self.cleanup = options.cleanup;
		self.routes = {};

		self.createRoute = function(options) {
			options = options || {};
			_.defaults(options, {
				'name': null,
				'callback': null,
				'extend': {},
				'cleanup': null
			});
			if ( !_.isString(options.name) || options.name === '' ) {
				throw 'Invalid `name` specified.';
			}
			var name_check = options.name.replace(/\W/g, '');
			if ( name_check !== options.name ) {
				throw 'Invalid `name` specified.';
			}
			if ( !_.isFunction(options.callback) && !_.isNull(options.callback) ) {
				throw 'Invalid `callback` specified.';
			}
			if ( !_.isObject(options.extend) ) {
				throw 'Invalid `extend` value specified.';
			}
			if ( !_.isNull(options.cleanup) && !_.isFunction(options.cleanup) ) {
				throw 'Invalid `cleanup` value specified.';
			}
			options.template_container_selector = '#child-route-container';
			var route = new Route(options, self.api, edison);
			self.routes[options.name] = route;
			return route;
		};

		self.log = function() {
			if ( !edison.getDebug() ) {
				return;
			}
			console.log(arguments);
		};

		_.each(edison.getRouteExtensions(), function(ext) {
			_.extend(Sandbox.prototype, ext);
		});

		_.extend(Sandbox.prototype, self.extensions);

		self.sandbox = new Sandbox(this);

		self.api = {
			createRoute: self.createRoute.bind(self),
			getRoutes: function() {
				return self.routes;
			},
			hasRoute: function(name) {
				if ( _.isUndefined(self.routes[name]) ) {
					return false;
				}
				return true;
			},
			getRoute: function(name) {
				return self.routes[name];
			},
			getDefaultRoute: function() {
				var routes = _.keys(self.routes);
				var route_name = routes[0];
				return self.routes[route_name];
			},
			getName: function() {
				return self.name;
			},
			getController: function() {
				return self.controller;
			},
			runCallback: function() {
				self.callback.call(self.sandbox);
			},
			getParentSection: function() {
				return self.parent_section;
			},
			cleanup: function() {
				if ( _.isFunction(self.cleanup) ) {
					self.cleanup.call(self.sandbox);
				}
			},
			getSandbox: function() {
				return self.sandbox;
			}
		};

		return self.api;

	};

	return Section;

});
