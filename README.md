Edison.js
=========

Edison.js is a rapid development framework that drastically simplifies the process of building scaleable single-page applications built on top of Backbone.js.

Applications built using Backbone and similar frameworks typically don't require full page reloads as the user navigates between different areas. That's a large part of the point. To facilitate this, Backbone provides a "Router" component:

http://backbonejs.org/#Router

The router allows you to pair URL paths with JavaScript functions to be called when they are accessed. For example:

	Router = Backbone.Router.extend({
	    'routes': {
	        'help': 'help'
	    },
	    'help': function() {
	        // This function is called when someone accesses http://domain.com#help
	    }
	});

That's great, and perhaps sufficient if you are building a small application. For anything non-trivial, building everything on top of this one low-level component will quickly become unmanageable. Imagine having a file where every section throughout the application is defined, along with the functionality attached to each section. And what if you want to bring in commonly used methods that are shared between sections? It's important to break this down into smaller components of related functionality. Backbone does not tell you how to do this. Edison.js provides you with a simple, opinionated approach with which you can quickly become affective.

The follow example demonstrates the creation of a "controller" using Edison.js:

	/**
	 * Here we define a "section" - a group of related areas within the app.
	 */
	var user = Router.createSection({
	    'name': 'user',
	    'callback': function() {
	        /*
	        This function is called once when the user enters this section. Navigating
	        between routes within this section does not cause the function to fire multiple
	        times. This provides you with a useful opportunity to do some section-wide setup.
	        */
	    }
	});

	/**
	 * Here we define a "route" - a specific area of functionality within the app that falls
	 * under the 'user' section. Given the name that we have specified below, you would
	 * access this route at the following URL:
	 *
	 * http://domain.com/#user/settings
	 */
	user.createRoute({
	    'name': 'settings',
	    /**
	     * This function is called every time the user accesses this route. Notice that little
	     * to no actual functionality is implemented here. Instead, the route is broken down into
	     * small functions within the 'extend' object. Organizing your code in this manner helps to
	     * ensure that everything stays neatly organized and quickly understandable.
	     */
	    'callback': function() {
	        this.message = 'Hello.';
	        this.doThis();
	        this.doThat();
	    },
	    'extend': {
	        /**
	         * This function will print 'Hello.' to the console. Notice that the `this.message`
	         * variable retains its value between the initial callback that was fired when the user
	         * entered this route, and when this extended function was called. Every route has a
	         * shared "sandbox" from which to work.
	         */
	        'doThis': function() {
	            console.log(this.message);
	        },
	        'doThat': function() {
	            // Do something...
	        }
	    }
	});
