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

		self.log = function() {
			if ( !edison.getDebug() ) {
				return;
			}
			console.log(arguments);
		};

		self.log('New Backbone controller defined: ' + self.name);

		_.each(edison.getRouteExtensions(), function(ext) {
			_.extend(Sandbox.prototype, ext);
		});

		_.extend(Sandbox.prototype, self.extensions);

		self.sandbox = new Sandbox(this);

		self.getDefaultTemplate = function(load_section_template, fn) {
			if ( load_section_template ) {
				var tpl;
				if ( _.isString(self.template) && !_.empty(self.template) ) {
					tpl = Router.getTemplate(self.template);
				} else {
					tpl = Handlebars.compile("<div id='child-route-container'></div>");
				}
				var template;
				if ( _.isFunction(self.templateData) ) {
					self.templateData(function(data) {
						template = $(tpl(data));
						$("#route-container").html(template);
					});
				} else {
					template = $(tpl());
					$("#route-container").html(template);
				}
			} else {
			}
			fn();
		};

		self.api = {
			createRoute: function(options) {
				options.template_container_selector = '#child-route-container';
				var route = new Route(options, self.api, edison);
				self.routes[options.name] = route;
				return route;
			},
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
			getDefaultTemplate: function(load_section_template, fn) {
				return self.getDefaultTemplate(load_section_template, fn);
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
