require(['Edison'], function(Edison) {

	var edison = new Edison({
		'route_container': 'route-container'
	});

	edison.extendRoutes({
		'test': function() {
			console.log('TEST!');
		}
	});

	var dashboard = edison.createSection({
		'name': 'dashboard',
		'callback': function() {
			console.log('I am the dashboard section.');
			this.test();
			this.bargle();
			this.name = 'tim';
			console.log('name1', this.name);
		},
		'extend': {
			'bargle': function() {
				console.log('hurgle');
			}
		},
		'cleanup': function() {
			console.log('dashboard section is cleaning up.');
		}
	});

	dashboard.createRoute({
		'name': 'index',
		'template': "<div>I am an awesome route.</div>",
		'init': function(fn) {
			console.log('dashboard/index init');
			fn();
		},
		'callback': function(id) {
			console.log('I am the dashboard/index route.');
			console.log('id', id);
			this.herp();
			console.log('container', this.container);
			this.container.html('aaah!');
			this.test();
			console.log('this', this);
			console.log('name2', this.section.name);
		},
		'extend': {
			'herp': function() {
				console.log('dashboard/index is herping');
			}
		},
		'cleanup': function() {
			console.log('dashboard/index route is cleaning up.');
		}
	});

	dashboard.createRoute({
		'name': 'test',
		'callback': function() {
			console.log('I am the dashboard/test route.');
			this.test();
		},
		'extend': {
			'herp': function() {
				console.log('dashboard/test is herping');
			}
		},
		'cleanup': function() {
			console.log('dashboard/test route is cleaning up.');
		}
	});

	var users = edison.createSection({
		'name': 'users',
		'callback': function() {
			console.log('I am the users section');
		},
		'cleanup': function() {
			console.log('users section is cleaning up.');
		}
	});

	users.createRoute({
		'name': 'index',
		'callback': function() {
			console.log('I am the users/index route.');
		},
		'cleanup': function() {
			console.log('users/index route is cleaning up.');
		}
	});

	edison.initRoutes();

});
