require(['Edison'], function(Edison) {

	var edison = new Edison();

	var dashboard = edison.createSection({
		'name': 'dashboard',
		'callback': function() {
			console.log('I am the dashboard section.');
		},
		'extend': {
			'test': function() {
			}
		},
		'cleanup': function() {
			console.log('dashboard section is cleaning up.');
		}
	});

	dashboard.createRoute({
		'name': 'index',
		'callback': function() {
			console.log('I am the dashboard/index route.');
			this.herp();
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