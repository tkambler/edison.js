require(['edison'], function(Edison) {

	var edison = new Edison({
		'container': 'route-container'
	});

	edison.extend({
		'test': function() {
			console.log('TEST!');
		},
		'interval_ids': [],
		'setInterval': function(fn, timeout) {
			this.interval_ids.push(setInterval(fn, timeout));
		}
	});

	edison.extendCleanup(function() {
		for ( var i = 0; i < this.interval_ids.length; i++ ) {
			clearInterval(this.interval_ids[i]);
		}
	});

	var dashboard = edison.createSection({
		'name': 'dashboard',
		'template': "<div>Section template. <div id='route' style='border: 1px solid green;'></div></div>",
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
			console.log('test', this.get('test'));
			console.log('container', this.container);
			console.log('this.container', this.container, this);
			this.container.innerHTML = 'aaah!';
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
		'template': "<div>123 - test</div>",
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
		'template': "<div>users/index</div>",
		'callback': function() {
			console.log('I am the users/index route.');
		},
		'cleanup': function() {
			console.log('users/index route is cleaning up.');
		}
	});

	edison.initRoutes();

});
