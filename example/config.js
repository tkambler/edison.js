requirejs.config({
	'baseUrl': '/',
	'paths': {
		'underscore': 'vendor/underscore/underscore',
		'chai': 'vendor/chai/chai',
		'mocha': 'vendor/mocha/mocha'
	},
	'shim': {
		'underscore': {
			'exports': '_'
		}
	},
	'packages': [
		{
			'name': 'edison',
			'location': 'edison',
			'main': 'edison'
		}
	]
});
