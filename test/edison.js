define([
	'chai',
	'src/lib/edison'
], function(chai, Edison) {

	var assert = chai.assert;
	var edison, section;

	describe('EdisonJS', function() {

		beforeEach(function(done) {
			require(['src/lib/edison'], function(E) {
				Edison = E;
				done();
			});
		});

		it("should provide a constructor function", function() {
			assert.isFunction(Edison);
		});

		it("should throw an error when no value is specified for `container`", function() {
			assert.throw(function() {
				edison = new Edison();
			}, 'A value must be specified for `container.`');
		});

		it("should throw an error when the specified route container cannot be found", function() {
			assert.throw(function() {
				edison = new Edison({
					'container': 'something'
				});
			});
		});

		it("should return an object when a valid value is specified for `container`", function() {
			assert.doesNotThrow(function() {
				edison = new Edison({
					'container': 'route_container'
				});
				console.log('xxx', edison);
			});
			assert.isObject(edison);
		});

		describe('createSection', function() {

			it("should throw an error when an invalid section `name` is specified", function() {

				assert.throw(function() {
					section = edison.createSection({
						'name': null
					});
				});

				assert.throw(function() {
					section = edison.createSection({
						'name': 'test 123'
					});
				});

				assert.throw(function() {
					section = edison.createSection({
						'name': ''
					});
				});

				assert.doesNotThrow(function() {
					section = edison.createSection({
						'name': 'test'
					});
				});

			});

			it("should throw an error when an invalid section `callback` is specified", function() {

				assert.doesNotThrow(function() {
					section = edison.createSection({
						'name': 'test',
						'callback': null
					});
				});

				assert.doesNotThrow(function() {
					section = edison.createSection({
						'name': 'test',
						'callback': function() {
						}
					});
				});

				assert.throw(function() {
					section = edison.createSection({
						'name': 'test',
						'callback': '123'
					});
				});

			});

			it("should throw an error when an invalid section `extend` option is specified", function() {

				assert.throw(function() {
					section = edison.createSection({
						'name': 'test',
						'extend': 123
					});
				});

				assert.doesNotThrow(function() {
					section = edison.createSection({
						'name': 'test',
						'extend': {}
					});
				});

			});

			it("should throw an exception when an invalid section `cleanup` option is specified", function() {

				assert.throw(function() {
					section = edison.createSection({
						'name': 'test',
						'cleanup': 123
					});
				});

				assert.doesNotThrow(function() {
					section = edison.createSection({
						'name': 'test',
						'cleanup': function() {
						}
					});
				});

			});

		});

		describe('Section.createRoute', function() {

			var section;

			beforeEach(function() {
				edison = new Edison({
					'container': 'route_container'
				});
				section = edison.createSection({
					'name': 'test'
				});
			});

			it("should throw an error when an invalid route `name` is specified", function() {

				assert.throw(function() {
					route = section.createRoute({
						'name': null
					});
				});

				assert.throw(function() {
					route = section.createRoute({
						'name': 'test 123'
					});
				});

				assert.throw(function() {
					route = section.createRoute({
						'name': ''
					});
				});

				assert.doesNotThrow(function() {
					route = section.createRoute({
						'name': 'test'
					});
				});

			});

			it("should throw an error when an invalid route `callback` is specified", function() {

				assert.doesNotThrow(function() {
					route = section.createRoute({
						'name': 'test',
						'callback': null
					});
				});

				assert.doesNotThrow(function() {
					route = section.createRoute({
						'name': 'test',
						'callback': function() {
						}
					});
				});

				assert.throw(function() {
					route = section.createRoute({
						'name': 'test',
						'callback': '123'
					});
				});

			});

			it("should throw an error when an invalid route `extend` option is specified", function() {

				assert.throw(function() {
					route = section.createRoute({
						'name': 'test',
						'extend': 123
					});
				});

				assert.doesNotThrow(function() {
					route = section.createRoute({
						'name': 'test',
						'extend': {}
					});
				});

			});

			it("should throw an exception when an invalid route `cleanup` option is specified", function() {

				assert.throw(function() {
					route = section.createRoute({
						'name': 'test',
						'cleanup': 123
					});
				});

				assert.doesNotThrow(function() {
					route = section.createRoute({
						'name': 'test',
						'cleanup': function() {
						}
					});
				});

			});

		});

	});

});
