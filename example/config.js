requirejs.config({
	'baseUrl': '/',
	'paths': {
		'underscore': 'vendor/underscore/underscore'
	},
	'shim': {
		'underscore': {
			'exports': '_'
		}
	},
	'packages': [
		{
			'name': 'Edison',
			'location': 'edison'
		}
	]
});
