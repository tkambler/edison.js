module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        'pkg': grunt.file.readJSON('package.json'),
        'uglify': {
            'options': {
                'banner': '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            'build': {
                'src': 'src/jquery.whenlive.js',
                'dest': 'dist/jquery.whenlive.js'
            }
        },
        'express': {
            'options': {
                'background': true
            },
            'dev': {
                'options': {
                    'script': 'express.js'
                }
            }
        },
        'watch': {
            'express': {
                'files': ['./src/*.js', './src/**/*.js', './example/*.js'],
                'tasks': [],
                'options': {
                    'spawn': false
                }
            }
        },
		'requirejs': {
			'minified': {
				'options': {
					'baseUrl': '.',
					'name': 'edison',
					'out': 'dist/edison.min.js',
					'optimize': 'uglify',
					'mainConfigFile': 'require.config.build.js'
				}
			},
			'unminified': {
				'options': {
					'baseUrl': '.',
					'name': 'edison',
					'out': 'dist/edison.js',
					'optimize': 'none',
					'mainConfigFile': 'require.config.build.js'
				}
			}
		}
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);

    // Express server
    grunt.registerTask('server', ['express:dev', 'watch']);

};
