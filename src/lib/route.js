define(function(require) {

	var _ = require('underscore'),
		Sandbox = require('./sandbox');

	/**
	 * @class Route
	 */
	var Route = function(options, section, edison) {

		_.defaults(options, {
			'init': function(fn) {
				fn();
			}
		});

		var self = this;
		self.title = null;
		self.name = options.name;
		self.section = section;
		self.callback = options.callback;
		self.extensions = options.extend;
		self.template = options.template || "<div></div>";
		self.cleanup = options.cleanup;

		self.log = function() {
			if ( !edison.getDebug() ) {
				return;
			}
			console.log(arguments);
		};

		/**
		 * Returns a string indicating the name of the section + this route.
		 */
		self.getPath = function() {
			return section.getName() + '/' + self.name;
		};

		self.log('New route defined: ' + self.getPath());

		_.each(edison.getRouteExtensions(), function(ext) {
			_.extend(Sandbox.prototype, ext);
		});

		self.sandbox = new Sandbox();
		self.sandbox.section = section.getSandbox();

		self.init = function(fn) {
			options.init.call(self.sandbox, fn);
		};

		_.each(self.extensions, function(fnc, extname) {
			self.sandbox[extname] = function() {
				fnc.apply(self.sandbox, arguments);
			};
		});

		self.loadTemplate = function() {
			var $tpl = $(self.template);
			$tpl.attr('id', 'section_' + self.section.getName() + '_route_' + self.name);
			edison.insertTemplate($tpl);
		};

		self.initRoute = function(id) {
			self.loadTemplate();
			Sandbox.prototype.container = $('#section_' + self.section.getName() + '_route_' + self.name);
			if ( edison.getActiveSection() !== self.section ) {
				// The user is making their first entry into this section.
				self.log('Initial entry into section: ' + section.getName());
				self.section.runCallback();
			} else {
				// The user is navigating within the same section.
			}
			edison.setActiveSection(self.section);
			edison.setActiveRoute(self.api);
			self.callback.call(self.sandbox, id);
		};

		/**
		 * Public Interface
		 */
		self.api = {
			getCallback: function() {
				return self.callback;
			},
			getSandbox: function() {
				return self.sandbox;
			},
			getName: function() {
				return self.name;
			},
			init: function() {
				self.init.apply(self, arguments);
			},
			initRoute: function() {
				self.initRoute.apply(self, arguments);
			},
			getTitle: function() {
				return self.title;
			},
			getFullPath: function() {
				return this.getFullPath.apply(self, arguments);
			},
			cleanup: function() {
				if ( _.isFunction(self.cleanup) ) {
					self.cleanup.call(self.sandbox);
				}
			}
		};

		return self.api;

	};

	_.extend(Route.prototype, {

		/**
		 * Returns the hashbang path at which this route can be accessed: section_name/route_name
		 */
		'getFullPath': function() {
			return this.section.getName() + '/' + this.name;
		}

	});

	return Route;

});
