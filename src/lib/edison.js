define(function(require) {

	var _ = require('underscore'),
		Section = require('./section'),
		Route = require('./route'),
		Router = require('./router'),
		util = require('./util');

	var Edison = function() {
		this.init.apply(this, _.toArray(arguments));
		return {
			'createSection': this.createSection.bind(this),
			'initRoutes': this.initRoutes.bind(this),
			'extend': this.extend.bind(this),
			'extendCleanup': this.extendCleanup.bind(this)
		};
	};

	_.extend(Edison.prototype, {

		'init': function(options) {
			options = options || {};
			_.defaults(options, this.options);
			this.options = options;
			if ( !_.isBoolean(options.pushState) ) {
				options.pushState = false;
			}
			if ( !options.container ) {
				throw 'A value must be specified for `container.`';
			} else {
				this.route_container = document.getElementById(options.container);
				if ( ! this.route_container ) {
					throw 'Specified route container does not exist: `' + options.container + '.`';
				}
				if ( options.pushState && util.supportsHistoryAPI() ) {
					this.enablePushState = true;
				}
			}
		},

		'options': {
			'container': null,
			'pushState': false
		},

		'debug': false,

		'enablePushState': false,

		'routes_initialized': false,

		'sections': {},

		'active_parent_section': null,

		'active_section': null,

		'active_section_intervals': [],

		'active_parent_section_intervals': [],

		'active_route': null,

		'Routes': null,

		'route_extensions': [],

		'log': function() {
			if ( !this.debug ) {
				return;
			}
			console.log(arguments);
		},

		'createSection': function(options) {
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
			this.sections[options.name] = new Section(options, this);
			return this.sections[options.name];
		},

		'checkParentSection': function(section_name) {
			if ( _.isString(this.sections[section_name].getParentSection()) ) {
				if ( this.active_parent_section !== this.sections[section_name].getParentSection() ) {
					if ( !_.empty(this.active_parent_section) ) {
						this.active_parent_section.cleanup();
						this.clearParentSectionIntervals();
					}
					this.active_parent_section = this.sections[section_name].getParentSection();
					var parentSection = this.sections[section_name].getParentSection();
					this.sections[parentSection].runCallback();
				}
			} else {
				this.active_parent_section = null;
				this.clearParentSectionIntervals();
			}
		},

		'clearParentSectionIntervals': function() {
			_.each(this.active_parent_section_intervals, function(interval_id) {
				clearInterval(interval_id);
			});
		},

		'initRoutes': function() {
			var self = this;
			this.log('Initializing routes...');
			if ( this.routes_initialized ) {
				return;
			}
			this.routes_initialized = true;
			this.router = new Router(this);
			this.router.bind('on_route', this.onRoute.bind(this));
			this.router.listen();
		},

		'onRoute': function(data) {
			this.log('onRoute', data);
			var self = this;
			if ( !this.sections[data.section_name] ) {
				return;
			}
			var section = this.sections[data.section_name],
				route;
			if ( !data.route_name ) {
				route = section.getDefaultRoute();
			} else {
				route = section.getRoute(data.route_name);
			}
			if ( !route ) {
				return;
			}

			_.each(self.active_section_intervals, function(interval_id) {
				clearInterval(interval_id);
			});

			var previousRoute = this.getActiveRoute();
			if ( previousRoute ) {
				previousRoute.cleanup();
				_.each(this.cleanupExtenders, function(ce) {
					ce.call(previousRoute.getSandbox());
				});
			}

			var previousSection = this.getActiveSection();
			if ( previousSection ) {
				if ( previousSection.getName() !== data.section_name ) {
					previousSection.cleanup();
				}
			}

			this.checkParentSection(data.section_name);
			route.init(data.route_id, function(err) {
				if ( err ) {
					// todo - ?
				}
			});
		},

		'navigate': function(route, leave_history) {
			var opts = {
				trigger: true,
				replace : leave_history
			};
			this.Routes.navigate(route, opts);
		},

		'setActiveSection': function(section) {
			this.active_section = section;
		},

		'setActiveRoute': function(route) {
			this.active_route = route;
		},

		'getDebug': function() {
			return this.debug;
		},

		'getActiveSection': function() {
			return this.active_section;
		},

		'getActiveRoute': function() {
			return this.active_route;
		},

		'createSectionInterval': function(fn, interval) {
			this.active_section_intervals.push(setInterval(fn, interval));
		},

		'createParentSectionInterval': function(fn, interval) {
			this.active_parent_section_intervals.push(setInterval(fn, interval));
		},

		'getRoutes': function() {
			return this.Routes;
		},

		'insertSectionTemplate': function(template) {
			this.route_container.innerHTML = '';
			this.route_container.appendChild(template);
		},

		'insertTemplate': function(template) {
			var container = document.getElementById('route');
			container.innerHTML = '';
			container.appendChild(template);
		},

		'extend': function(ext) {
			if ( !_.isObject(ext) ) {
				throw 'Invalid extension(s) specified: expected an object.';
			}
			this.route_extensions.push(ext);
		},

		'getRouteExtensions': function() {
			return this.route_extensions;
		},

		'cleanupExtenders': [],

		'extendCleanup': function(fn) {
			if ( !_.isFunction(fn) ) {
				throw 'extendCleanup expects a single parameter: a callback function.';
			}
			this.cleanupExtenders.push(fn);
		}

	});

	return Edison;

});
