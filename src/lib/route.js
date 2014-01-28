define(function(require) {

	var _ = require('underscore'),
		RouteSandbox = require('./routesandbox');

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
		self.template = options.template;
		self.templateData = options.templateData || null;
		self.template_container_selector = '#child-route-container';
		self.compiled_template = null;
		self.cleanup = options.cleanup;
		self.defineModel = options.defineModel;
		self.model = null;
		self.actions = null;
		self.notice = null;

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

		self.log('New Backbone route defined: ' + self.getPath());

		self.getParameters = {};

		self.sandbox = new RouteSandbox();

		self.init = function(fn) {
			options.init.call(self.sandbox, fn);
		};

		_.each(self.extensions, function(fnc, extname) {
			self.sandbox[extname] = function() {
				fnc.apply(self.sandbox, arguments);
			};
		});

		self.getDefaultTemplate = function(callback) {
			var template = Router.getTemplate(self.template);
			if ( !template ) {
				template = '<div></div>';
				self.compiled_template = Handlebars.compile(template);
			} else {
				self.compiled_template = template;
			}
			var template_container = $(self.template_container_selector);
			if ( $(template_container).size() !== 1 ) {
				throw 'Unable to locate template container: ' + self.template_container_selector;
			}
			var template_data = {};
			if ( _.isFunction(self.templateData) ) {
				self.templateData.call(self, function(template_data) {
					var templateObj = $(self.compiled_template(template_data));
					$(templateObj).addClass('section_' + section.getName());
					$(templateObj).addClass('route_' + self.name);
					$(template_container).html(templateObj);
					callback();
				});
			} else {
				var templateObj = $(self.compiled_template(template_data));
				$(templateObj).addClass('section_' + section.getName());
				$(templateObj).addClass('route_' + self.name);
				$(template_container).html(templateObj);
				callback();
			}
		};

		self.createNotification = function() {
			if ( _.empty(self.notice) || !_.isObject(self.notice) ) {
				$("#notification-container").hide();
				return;
			}
			Widget.getWidget('Alert', self.notice, function(obj, api) {
				$("#notification-container", self.container).html(obj);
				$("#notification-container").show();
			});
		};

		self.createActions = function() {
			if ( _.empty(self.actions) ) {
				$("#actions-container .bts").html(null);
				$("#actions-container").show();
			} else {
				$("#actions-container .bts").html(null);
				_.each(self.actions, function(action, k) {
					var bt = $("<button class='btn btn-white btn-small' id='btn-1' href='#btn-1'><i class='text'></i> <span class='text'></span></button>");
					$('span.text', bt).html(action.label);
					if ( !_.empty(action.icon) ) {
						$('i.text', bt).addClass(action.icon);
					}
					if ( _.isFunction(action.onClick) ) {
						$(bt).on('click', function(e) {
							action.onClick();
						});
					}
					$("#actions-container .bts").append(bt);
				});
				$("#actions-container").show();
			}
		};

		self.initRoute = function() {
			RouteSandbox.prototype.container = $('.section_' + self.section.getName() + '.route_' + self.name);
			if ( edison.getActiveSection() !== self.section ) {
				// The user is making their first entry into this section.
				self.log('Initial entry into section: ' + section.getName());
				self.section.runCallback();
			} else {
				// The user is navigating within the same section.
			}
			edison.setActiveSection(self.section);
			edison.setActiveRoute(self.api);
			self.getModel(function() {
				self.callback.call(self.sandbox);
			});
		};

		self.getModel = function(fn) {
			if ( !_.isFunction(options.defineModel) ) {
				fn();
				return;
			}
			var d = options.defineModel.call(self.sandbox);
			if ( _.isEmpty(d) ) {
				fn();
				return;
			}
			self.model = new window[d.model]({
				_id: d.id
			});
			self.model.fetch({
				success: function() {
					self.sandbox.model = self.model;
					fn();
				},
				failure: function() {
				}
			});
		};

		self.setGetParameters = function(obj) {
			self.getParameters = obj;
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
			getDefaultTemplate: function() {
				self.getDefaultTemplate.apply(self, arguments);
			},
			init: function() {
				self.init.apply(self, arguments);
			},
			initRoute: function() {
				self.initRoute.apply(self, arguments);
			},
			setGetParameters: function() {
				self.setGetParameters.apply(self, arguments);
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
