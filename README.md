EdisonJS
=========

EdisonJS is a simple, extendable JavaScript routing library with a focus on organization. EdisonJS encourages the developer to organize their application as a series of "sections" and underlying "routes."

EdisonJS encourages the developer to organize their application's routes

```html
<!DOCTYPE html>
<html>
<body>
<div id="route_container">
	<!-- When a route is loaded, its contents will be inserted here. -->
</div>
</body>
</html>
```

## Using EdisonJS

### Creating a New Instance of EdisonJS

In this example, we create a new instance of EdisonJS and pass a single option - `container`. Each route that we define will have a template associated with it, and this option determines where those templates are inserted into our document.

```javascript
var edison = new Edison({
	'container': 'route_container'
});
```

### Sections and Routes

Most JavaScript routing libraries provide little to no guidance in terms of how one might best go about organizing complex single-page applications with many routes. EdisonJS seeks to simplify the organizational structure of complex single-page applications by encouraging developers to organize their applications as a series of parent ("section") <-> child ("route") relationships. The result is a simple, clean, and powerful organizational structure. Let's look at an example:

### Creating a Section

A typical web application is comprised of many different "routes." EdisonJS encourages the developer to group related routes under a parent "section" as shown below:

```javascript
var users = edison.createSection({
	'name': 'users', // Determines our URL structure
	'callback': function() {
		console.log("Welcome to the 'users' section.");
	}
});
```

When a user navigates to a route belonging to the "users" section for the first time, the section's callback function will be fired. As the user navigates between routes within the section, this callback function does not continue to fire. As a result, this callback function is useful for performing setup routines that related routes would typically have to perform on their own.

### Creating a Route

```javascript
users.createRoute({
	'name': 'list', // Determines our URL structure
	'template': template, // A string containing this route's template
	'callback': function() {
		console.log("Welcome to the 'users/list' route.");
	}
});
```

With our first section and route defined, we can now navigate to the following URL:

```html
http://site.com/#users/list
```

In your console, you should now see the following messages:

```javascript
Welcome to the 'users' section.
Welcome to the 'users/list' route.
```

### Passing Parameters

Routes can accept a single `id` parameter as shown below:

```javascript
// URL: http://site.com/#users/list/5

users.createRoute({
	'name': 'list',
	'template': template,
	'callback': function(id) {
		// id === 5
	}
});
```

For greater flexibility, you can also access query parameters directly, as shown below:

```javascript
// URL: http://site.com/#users/list?name=Joe

users.createRoute({
	'name': 'list',
	'template': template,
	'callback': function() {
		var name = this.get('name'); // name === 'Joe'
	}
});
```

### Extending Sections

Sections can extend their functionality as shown below. As a result, sections can remain organized as they inevitably grow more complex:

```javascript
var users = edison.createSection({
	'name': 'users',
	'callback': function() {
		this.doSomething();
	},
	'extend': {
		'doSomething': function() {
			console.log("The 'users' section is doing something.");
		}
	}
});
```

### Extending Routes

In a similar manner, routes can also extend their functionality.

```javascript
users.createRoute({
	'name': 'list',
	'template': template,
	'callback': function() {
		this.list();
	},
	'extend': {
		'list': function() {
			console.log('I am listing.');
		}
	}
});
```

### Accessing Section Functionality from Routes

A route can access its parent section as shown below:

```javascript
var users = edison.createSection({
	'name': 'users',
	'callback': function() {
		this.day = 'Tuesday';
	},
	'extend': {
		'growl': function() {
			console.log("The 'users' section is growling.");
		}
	}
});

users.createRoute({
	'name': 'list',
	'template': template,
	'callback': function() {
		var day = this.section.day;
		this.section.growl();
	}
});
```

### Global Section and Route Extensions

Functionality shared across all sections and routes throughout the application can be extended globally as shown below:

```javascript
edison.extend({
	'request': function() {
		/* All sections and routes can now call: this.request(); */
	}
});
```

### Cleanup Routines (Optional)

If a section or route is given a `cleanup` method, it will be called when the user navigates to a different section or route. See below:

```javascript
var users = edison.createSection({
	'name': 'users',
	'callback': function() {
	},
	'cleanup': function() {
		// Called when the user leaves this section.
	}
});

users.createRoute({
	'name': 'list',
	'template': template,
	'callback': function() {
	},
	'cleanup': function() {
		// Called when the user leaves this route.
	}
});
```

## Installation

### Bower

```
$ bower install edisonjs
```

## Configuration

Add the following options to your RequireJS configuration (adjust `location` as appropriate):

```javascript
'packages': [
	{
		'name': 'edison',
		'location': '/edison/dist/',
		'main': 'edison'
	}
]
```


## License (MIT)

```
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```