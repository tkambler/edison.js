(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define([], factory);
	} else if (typeof exports === "object") {
		module.exports = factory();
	} else {
		root.UMDRouter = factory();
	}
}(this, function () {

	/**
	 * Router constructor function
	 * @constructor Router
	 */
	var UMDRouter = function () {
		var self = this;

		// Watch hashchange
		window.onhashchange = function () {
			self.process();
		};

		// Run on load
		window.onload = function () {
			self.process();
		};
	};

	/**
	 * Container object for routes
	 * @memberof UMDRouter
	 * @member {object}
	 */
	UMDRouter.prototype.routes = {};

	/**
	 * Container array for history
	 * @memberof UMDRouter
	 * @member {array}
	 */
	UMDRouter.prototype.history = [];

	/**
	 * Processes route change
	 * @memberof UMDRouter
	 * @method process
	 */
	UMDRouter.prototype.process = function () {
		var self = this,
			fragment = window.location.hash.replace("#", ""),
			match = self.match(),
			route = match.route,
			args = match.args,
			prevRoute = false,
			prevSandbox = null,
			routeObj = [];

		// Get prev_route
		if (self.history.length !== 0) {
			prevRoute = self.routes[self.history[self.history.length - 1].matcher];
		}

		// Ensure a match has been made
		if (!route) {
			return;
		}

		routeObj = self.routes[route];

		// Get current route and unload
		if (prevRoute && prevRoute.unload) {
			prevRoute.unload.apply(this);
			for (var key in UMDRouter.unloadFunctions) {
				UMDRouter.unloadFunctions[key].apply(prevSandbox);
			}
		}

		var beforeCallback = function (before) {

			if (typeof before === "undefined") {
				before = true;
			}

			if (typeof args[0] === "function") {
				args.shift();
			}

			// If before returned false, go back
			if (!before) {
				self.go(self.history[self.history.length - 1].fragment);
			}

			if (!routeObj.load) {
				return;
			}

			var sandbox = self.createSandbox(route);
			prevSandbox = sandbox;

			routeObj.load.apply(sandbox, args);
			self.history.push({
				matcher: route,
				fragment: fragment
			});

		};

		// Check and run 'before'
		if (routeObj.before) {
			args.unshift(beforeCallback);
			routeObj.before.apply(this, args);
			return;
		} else {
			beforeCallback(true);
		}

	};

	/**
	 * @method createSandbox
	 */
	UMDRouter.prototype.createSandbox = function (route) {

		var sandbox = {},
			routeObj = this.routes[route],
			key;

		for (key in routeObj.extend) {
			if (typeof routeObj.extend[key] === "function") {
				sandbox[key] = routeObj.extend[key].bind(sandbox);
			} else {
				sandbox[key] = routeObj.extend[key];
			}
		}

		for (key in UMDRouter.extensions) {
			if (typeof UMDRouter.extensions[key] === "function") {
				sandbox[key] = UMDRouter.extensions[key].bind(sandbox);
			} else {
				sandbox[key] = UMDRouter.extensions[key];
			}
		}

		return sandbox;

	};

	/**
	 * Matches routes and fires callback
	 * @memberof UMDRouter
	 * @method match
	 */
	UMDRouter.prototype.match = function () {
		var self = this,
			fragment = window.location.hash.replace("#", ""),
			matcher,
			route,
			args = [],
			matched = false,
			i,
			z;

		// Match root
		if (fragment === "/" || fragment === "" && self.routes.hasOwnProperty("/")) {
			matched = "/";
		} else {
			// Match routes
			for (route in self.routes) {
				matcher = fragment.match(new RegExp(route.replace(/:[^\s/]+/g, "([\\w-]+)")));
				if (matcher !== null && route !== "/") {
					args = [];
					// Get args
					if (matcher.length > 1) {
						for (i = 1, z = matcher.length; i < z; i++) {
							args.push(matcher[i]);
						}
					}
					matched = {
						route: route,
						args: args
					};
				}
			}
		}

		// Return matched and arguments
		return matched;

	};

	/**
	 * Method to reload (refresh) the route
	 * @memberof UMDRouter
	 * @method reload
	 */
	UMDRouter.prototype.reload = function () {
		this.process();
	};

	/**
	 * Method for binding route to callback
	 * @memberof UMDRouter
	 * @method on
	 * @param {string} route - The route to match against
	 * @param {function|object} handler - The callback function or functions (object)
	 */
	UMDRouter.prototype.on = function (route, handler) {

		var handlerObj = {};

		if (typeof handler === "function") {
			handlerObj.load = handler;
		} else if (typeof handler === "object") {
			handlerObj = handler;
		} else {
			throw "Error creating route: " + route + ". `handler` must be a function or object.";
		}

		this.defaults(handlerObj, {
			"before": null,
			"load": null,
			"unload": null,
			"extend": {}
		});

		this.routes[route] = handlerObj;

	};

	/**
	 * See underscore.defaults().
	 * @memberof UMDRouter
	 * @method defaults
	 */
	UMDRouter.prototype.defaults = function (obj, defaults) {
		obj = obj || {};
		for (var key in defaults) {
			if (!obj[key]) {
				obj[key] = defaults[key];
			}
		}
	};

	/**
	 * Method for programatically navigating to route
	 * @memberof UMDRouter
	 * @method go
	 * @param {string} path - The route to navigate to
	 */
	UMDRouter.prototype.go = function (path) {

		var location = window.location,
			root = location.pathname.replace(/[^\/]$/, "$&"),
			url,
			self = this;

		// Handle url composition
		if (path.length) {
			// Fragment exists
			url = root + location.search + "#" + path;
		} else {
			// Null/Blank fragment, nav to root
			url = root + location.search;
		}

		if (history.pushState) {
			// Browser supports pushState()
			history.pushState(null, document.title, url);
			self.process();
		} else {
			// Older browser fallback
			location.replace(root + url);
			self.process();
		}
	};

	/**
	 * Container object for extensions
	 * @memberof UMDRouter
	 * @member {object}
	 */
	UMDRouter.extensions = {};

	/**
	 * Allows for extending the UMDRouter object
	 * @memberof UMDRouter
	 * @method extend
	 * @param {object} ext - The extension to be applied
	 */
	UMDRouter.extend = function (ext) {

		if (typeof ext !== "object") {
			throw "Invalid extension specified.";
		}

		for (var key in ext) {
			UMDRouter.extensions[key] = ext[key];
		}

	};

	/**
	 * Container array for unload functions
	 * @memberof UMDRouter
	 * @member {array}
	 */
	UMDRouter.unloadFunctions = [];

	/**
	 * Adds unload function to array
	 * @memberof UMDRouter
	 * @method unload
	 * @param {function} fn - The function to call on unload
	 */
	UMDRouter.unload = function (fn) {

		if (typeof fn !== "function") {
			throw "Invalid callback function specified.";
		}

		UMDRouter.unloadFunctions.push(fn);

	};

	/**
	 * @returns the UMDRouter contructor
	 */
	return UMDRouter;

}));
