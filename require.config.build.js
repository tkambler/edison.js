requirejs.config({
	'baseUrl': '.',
	'paths': {
		'underscore': 'bower_components/underscore/underscore'
	},
	'shim': {
		'underscore': {
			'exports': '_'
		}
	},
	'packages': [
		{
			'name': 'edison',
			'location': 'src'
		}
	]
});
