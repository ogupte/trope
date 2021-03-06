# trope.js
<a id="overview"></a>
## Overview
Trope is a simple interface for JavaScript inheritance that provides some extra, useful capabilities. At the core of this tool are prototypes which are used to maintain [private state](https://github.com/ogupte/trope#private-properties), allow access to [super functions](https://github.com/ogupte/trope#inheritance), and create objects with [multiple inheritance](https://github.com/ogupte/trope#multiple-inheritance). It's easy to start integrating with most projects since [native JS](https://github.com/ogupte/trope#native-js-compatibility) constructors, object prototypes and ES6 classes are already valid Trope definitions.

### [API Documentation](https://github.com/ogupte/trope/blob/master/trope-api.md)

<a id="features"></a>
## Features
* [Simplified object inheritance](https://github.com/ogupte/trope#inheritance)
* [Private object state](https://github.com/ogupte/trope#description-private-members)
* [Super functions](https://github.com/ogupte/trope#description-super)
* [Multiple inheritance](https://github.com/ogupte/trope#description-multiple-inheritance)
* [Compatible with native JS](https://github.com/ogupte/trope#native-js-compatibility)

<a id="examples"></a>
### Examples
* [Object factories](https://github.com/ogupte/trope#object-factories)
* [Private properties](https://github.com/ogupte/trope#private-properties)
* [Inheritance](https://github.com/ogupte/trope#inheritance)
* [Multiple Inheritance](https://github.com/ogupte/trope#multiple-inheritance)
* [Native JS Compatibility](https://github.com/ogupte/trope#native-js-compatibility)
* [Selfish Definitions](https://github.com/ogupte/trope#selfish-definitions)

<a id="object-factories"></a>
#### Object factories
A simple object factory.
```javascript
var Greeter = Trope({
    setName: function (name) {
        this.name = name;
    },
    sayHello: function () {
        return 'Hello, ' + this.name + '!';
    }
});

var greeter = Greeter.create();
greeter.setName('Bertrand');
greeter.sayHello(); // 'Hello, Bertrand!'
```
Pass in an *initializer* function, to set state upon creation.
```javascript
var Greeter = Trope(function (name) {
    this.setName(name);
},{
    setName: function (name) {
        this.name = name;
    },
    sayHello: function () {
        return 'Hello, ' + this.name + '!';
    }
});

var greeter = Greeter.create('Bertrand');
greeter.name; // 'Bertrand'
greeter.sayHello(); // 'Hello, Bertrand!'
```
New objects can also be created by calling the Trope as a function with or without the `new` operator.
```javascript
greeter = Greeter.create('Bertrand');
greeter = Greeter('Bertrand');
greeter = new Greeter('Bertrand');
```

<a id="private-properties"></a>
#### Private properties
`privacy` mode can be enabled to prevent object properties from being accessed by an outside context.
```javascript
var Greeter = Trope.privacy(function (name) {
    this.setName(name);
},{
    setName: function (name) {
        this.name = name;
    },
    sayHello: function () {
        return 'Hello, ' + this.name + '!';
    }
});

var greeter = Greeter.create('Bertrand');
greeter.name; // undefined
greeter.sayHello(); // 'Hello, Bertrand!'
```
Public properties can still be set in `privacy` mode by setting them on `this.exports`.
```javascript
var Greeter = Trope.privacy(function (name) {
    this.setName(name);
},{
    setName: function (name) {
        this.name = name;
        this.exports.exposedName = name;
    },
    sayHello: function () {
        return 'Hello, ' + this.name + '!';
    }
});

var greeter = Greeter.create('Bertrand');
greeter.name; // undefined
greeter.exposedName; // 'Bertrand'
greeter.sayHello(); // 'Hello, Bertrand!'
```
`Trope.privacy` is the easiest way to define a trope in privacy mode, but you also be explicit in your definition with [`Trope.define`](https://github.com/ogupte/trope/blob/master/trope-api.md#module-define):
```javascript
var Greeter = Trope.define({
	privacy: true,
	init: function (name) {
		 this.setName(name);
	},
	prototype: {
		 setName: function (name) {
			  this.name = name;
			  this.exports.exposedName = name;
		 },
		 sayHello: function () {
			  return 'Hello, ' + this.name + '!';
		 }
	}
});
```
See how [private properties](https://github.com/ogupte/trope#description-private-members) are implemented in Trope.

<a id="inheritance"></a>
#### Inheritance
Start with an existing definition
```javascript
var Animal = Trope({
    getLongName: function () {
        return 'Animalia';
    }
});
```
Inherit from base definitions by chaining off of them with `turn`, or `proto`, or `extend` and passing in a new definition. Functions can be overloaded and the original can be called with `this.super()` (or `this._super()`).
```javascript
var Vertebrate = Animal.turn({
    getLongName: function () {
        return this.super() + ' Chordata';
    }
});

var Mammal = Vertebrate.turn({
    getLongName: function () {
        return this.super() + ' Mammalia';
    }
});

var mammal = Mammal.create();
mammal.getLongName(); // 'Animalia Chordata Mammalia'
```
The native `instanceof` operator works as expected since Trope inheritance is based on JavaScript's native inheritance mechanism.
```javascript
mammal instanceof Mammal;
mammal instanceof Vertebrate;
mammal instanceof Animal;
```

See how [this.super](https://github.com/ogupte/trope#description-super) is implemented in Trope.

<a id="multiple-inheritance"></a>
##### Multiple Inheritance
First we define two unrelated Tropes `Logger` and `EventEmitter`.
```javascript
var Logger = Trope({
    log: function (msg) {
        console.log(msg);
    }
});

var EventEmitter = Trope({
    on: function (name, handler) {
        if (!this.eventMap) {
            this.eventMap = {};
        }
        if (!this.eventMap[name]) {
            this.eventMap[name] = [];
        }
        this.eventMap[name].push(handler);
    },
    fire: function (name, data) {
        if (this.eventMap && this.eventMap[name]) {
            this.eventMap[name].forEach(function (handler) {
                handler.call(this, data);
            }.bind(this));
        }
    }
});
```
They can be combined to create a new Trope `Eventedlogger`.
```javascript
var EventedLogger = Trope([Logger, EventEmitter]);

var eventedLogger = EventedLogger.create();
eventedLogger.on('logme', function (msg) {
	eventedLogger.log('LOGME: ' + msg);
});
eventedLogger.fire('logme', 'hello'); // logs 'LOGME: hello'
eventedLogger.fire('logme', 'world'); // logs 'LOGME: world'
```
Multiple inheritance can often result in some interesting combinations.

For example, define a simple `Cat`.
```javascript
// Define a `Cat`
var Cat = Trope(function (name) { // init function
    this.name = name;
}, {
    vocalize: function () {
        return 'Meow!';
    }
});

var cat = Cat.create('Raja');
cat.vocalize(); // 'Meow!'
```
<a id="LoggingEventedCat"></a>
Now inherit from `Logger`, `EventEmitter`, and `Cat` while passing in a new definition to create something completely different.
```javascript
var LoggingEventedCat = Trope([Logger, EventEmitter, Cat], function (name) { // init function
		this.super.as(Cat)(name);
		this.on('meow', function (sound) {
			console.log(this.name + ': ' + sound);
		});
	},{ // overload the `vocalize` method inherited from `Cat`
		vocalize: function (sound) {
			sound = sound || this.super.as(Cat)();
			this.fire('meow', sound);
		}
	});

var loggingEventedCat = LoggingEventedCat.create('Raja');
loggingEventedCat.vocalize(); // logs 'Raja: Meow!'
loggingEventedCat.vocalize('Purr...'); // logs 'Raja: Purr...'
```
Yes, defining a `LoggingEventedCat` is entirely possible in Trope, however the usefulness of these composites is at the discretion of the developer.

See how [multiple inheritance](https://github.com/ogupte/trope#description-multiple-inheritance) and [this.super](https://github.com/ogupte/trope#description-super) are implemented in Trope.

<a id="native-js-compatibility"></a>
#### Native JS Compatibility
Trope is completely compatibile with native JS because JavaScript constructors are valid Trope definitions! This makes it easy to start using it without having to modify an existing code base.
```javascript
// Native JS constructor Shape
function Shape (sides) {
    this.sides = sides;
}
Shape.prototype.getSides = function () {
    return this.sides;
};

var triangle = new Shape(3);
triangle instanceof Shape; // true
triangle.getSides(); // 3
```
`Shape` can be wrapped with Trope and immediately treated as any other Trope to create a `Shape` object. `instanceof` still works since `Shape.prototype` is part of `triangle`'s prototype chain.
```javascript
var triangle = Trope(Shape).create(3);
triangle instanceof Shape; // true
```
Wrapping `Shape` in a Trope gives it access to the same features available to any other Trope. Chain off of it to add new functionality or make it more specific.
```javascript
var Quadrilateral = Trope(Shape).turn(function (opts) {
    this.sides = 4;
});

var quadrilateral = Quadrilateral.create();
quadrilateral instanceof Quadrilateral;
quadrilateral instanceof Shape;
quadrilateral.getSides(); // 4
```

<a id="selfish-definitions"></a>
#### Selfish Definitions
Trope allows for different styles in defining prototypes, classes, or factories. `selfish` is a style where each method can be explicitly passed the object reference as the first parameter. This is useful if you find yourself typing `var self = this` or `var that = this` at the beginning of every method. It's also a style that Python developers will be very familiar with ([Python classes](https://docs.python.org/2/tutorial/classes.html)).
```javascript
var Greeter = Trope.selfish({
	__init__: function (self, name) {
		self.name = name;
	},
	setName: function (self, name) {
		self.name = name;
	},
	sayHello: function (self) {
		return 'Hello, ' + self.name + '!';
	}
});

var greeter = Greeter('Bertrand');
greeter.sayHello(); // "Hello, Bertrand!"
greeter.setName('Russell');
greeter.sayHello(); // "Hello, Russell!"
```
Note that `Trope.selfish` will just set the `selfish` flag on the Trope definition and accept the same arguments as the [`Trope`](https://github.com/ogupte/trope/blob/master/trope-api.md#module-trope) or [`Trope.interpret`](https://github.com/ogupte/trope/blob/master/trope-api.md#module-interpret) functions. An equivalent definition with [`Trope.define`](https://github.com/ogupte/trope/blob/master/trope-api.md#module-define) could look like this:
```javascript
var Greeter = Trope.define({
	selfish: true,
	constructor: function Greeter (self, name) {
		self.name = name;
	},
	prototype: {
		setName: function (self, name) {
			self.name = name;
		},
		sayHello: function (self) {
			return 'Hello, ' + self.name + '!';
		}
	}
});

var greeter = Greeter('Bertrand');
greeter.sayHello(); // "Hello, Bertrand!"
greeter.setName('Russell');
greeter.sayHello(); // "Hello, Russell!"
```

## Description
### Another OO Lib, seriously?
I know that OO libs are somewhat of a...well [trope](http://en.wiktionary.org/wiki/trope#Noun). The reason is because different people have different, sometimes strongly-held beliefs about how object-oriented programming works and what it should look like. As the author, I am not very opinionated on this subject and feel you should be able to use whatever paradigm you happen to subscribe to. The purpose of Trope is not to change your way of thinking, but to provide a tool that can make OO JavaScript a lot easier to code, review, and test.

#### But traits, classes, mixins, monads, gonads...
Yes those are all great abstractions (except maybe gonads), and you should use each of them where appropriate. Trope doesn't claim to follow the one true paradigm, but it does make it simple to quickly code up object factories that play nice with native JS, use inheritance, respect private members, call overloaded functions, and do multiple inheritance.

## Feature Details
<a id="description-private-members"></a>
### Private object state
Trope takes a slightly unique approach to implementing privacy in objects. Existing libraries and patterns mostly use logic wrapped in a closure to prevent external access. Trope combines this with access to an exclusive part of the prototype chain to maintain private state with hidden properties on the created object.

Normally, objects will have a prototype chain similar to below where the only reference to the object is the the HEAD of the chain, in this case `{public}` where the object properties can be referenced.
```
   |
   V
{public} -> {proto} -> {object} -> null
```
Trope creates another acting head to this chain (`{private}`) which can only be accessed by methods inside the definition and not from any outside context.
```
                |
                V
{private} -> {public} -> {proto} -> {object} -> null
```
The result is an object with real private members rather than just some private state on an object defined in a closure. It may also give inheriting definitions access to this private context, elevating these members to a *protected* status. [see example](https://github.com/ogupte/trope#private-properties).

<a id="description-super"></a>
### Access to Super Methods
Calling super functions in native JS usually involves code like `SuperName.prototype.methodName.call(this, arg1, ...)`. With Trope, `this.super()` is smart enough to know which is the correct super function of the currently executing context. This makes your code a lot easier to read and write. It also allows the developer to create new links to the middle of inheritance chains without having to modify references when calling super methods. [see example](https://github.com/ogupte/trope#inheritance).

When inheriting from many different parents, you can reference any of them with `this.super.as` allowing you to call masked functions that are not members of the immediate parent. [see example](https://github.com/ogupte/trope#multiple-inheritance).

<a id="description-multiple-inheritance"></a>
### Multiple Inheritance
Multiple Inheritance is not a feature of the JavaScript language, which is a good thing! The single inheritance restriction eliminates a lot of the complexity and ambiguity involved with allowing objects to inherit from various unrelated parents. Also multiple inheritance is not necessary, and a talented programmer could avoid these issues by not using multiple inheritance altogether.

Still, there is sometimes a desire to inherit behavior from various unrelated objects in certain cases. The solution to this problem in JavaScript often involves using traits, mixins, the jquery or underscore `extend` functions, or even the crude `for..in` loop to produce an aggregate object with a union of properties. Problems that often occur with these approaches include information loss about the kind of object being inherited, lost references/errors when collisions occur, and prototype chain pollution. Some libraries have very sophisticated techniques for overcoming these issues, but I feel it's easier to embrace prototypes rather than fight them.

Trope handles multiple inheritance by ensuring the prototype chain remains clean. Overloaded methods can be accessed with `this.super.as`, privacy is maintained, and the object's instanceof relationship can be determined with `Trope.instanceOf`.

The solution is to have dynamically generated Tropes created upon definition so that JavaScript's *single* inheritance restriction can be used to emulate a *multiple* inheritance relationship.

Refer to the [LoggingEventedCat](https://github.com/ogupte/trope#LoggingEventedCat) example. The object `loggingEventedCat` does not inherit from `EventEmitter`. Rather it inherits from the dynamically created `[EventEmitter which inherits Logger]`. This allows for multiple unrelated parent chains to be normalized into a single, direct inheritance chain. Using these dynamically generated definitions means that the native `instanceof` operator cannot be depended on for these kind of objects. However, the `Trope.instanceOf` function is available and will still determine the correct relationship.

## How to get it
### Node
install with `npm`

    npm install --save trope

### Browser
install with `bower`

    bower install --save trope

*or* download and use directly as a script
```html
<script src="trope.js"></script>
```

### git
clone git reposity

    git clone https://github.com/ogupte/trope.git
then use npm to install or link it

    npm install ./trope
*or*

    cd trope; sudo npm link

## Test
### Unit
Tests are in `mocha` using `chaijs`

    grunt test
or you can run test in the browser by opening `test/browser/test.html`

### Coverage
Run the code coverage report using `blanket`.

    grunt coverage
