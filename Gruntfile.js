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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');


    // Default task(s).
    grunt.registerTask('default', ['uglify']);

    // Express server
    grunt.registerTask('server', ['express:dev', 'watch']);

};
