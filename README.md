# trope.js
## Description
Use Trope to simplify development by taking advantage of JS prototypes. Prototypes are at the core of this library which uses them to implement [private state](#private-properties), access [super methods and constructors](#inheritance), and create composite objects with [multiple inheritance](#multiple-inheritance). It's also easy to start integrating with most projects since [native JS](#native-js-compatibility) constructors are fully [backward compatible](#native-js-compatibility) with Trope definitions.

[See examples](#examples) for some ways Trope can be used.

### Private State<a id="description-private-members"></a>
Trope takes a unique approach to implementing private state in objects. Most existing libraries and patterns use logic defined in a closure to prevent external access. Trope combines this approach with prototypes to create truly private members which are actual object properties.

Normally, objects follow a similar prototype chain where the only reference to the object is the the HEAD of the chain.
```
   |
  \|/
   V
{public} -> {proto} -> {object} -> null
```
Trope creates another link in this chain (`{private}`) which can only be accessed by methods inside the definition and not by any outside references.
```
                |
               \|/
                V
{private} -> {public} -> {proto} -> {object} -> null
```
This creates an object which has truly private members rather than just some private state within a closure. It also gives any inheriting definitions access to this private context, elevating these members to a *protected* status.

### Access to Super<a id="description-super"></a>
Accessing super constructors and methods in JS involves code like `SuperClass.call(this, arg1, ...)`. In Trope, `this.super()` is smart enough to know which is the super function of the currently executing function, even if one doesn't exist (in which case, `this.super` will be `undefined`). This makes for a lot cleaner implementions when inheritance is involved, and allows the developer to new links to the middle of inheritance chains without having to change references to call the correct super functions.

Another cool feature of the super implementation is that if you inheriting from many different Tropes, you can specificically call out which one you'd like to reference with `this.super.as`. This enables the developer to call masked functions of Tropes that are not direct parents.

### Multiple Inheritance<a id="description-multiple-inheritance"></a>
Multiple Inheritance is not a feature of the JavaScript language. This is a good thing! Single inheritance keeps object hierarchies simple and relatively easy to reason about since an object can only inherit from one other object.

That said, developers have time and again have attempted to get around this property of the language by using antipatterns like mixins. This can be harmful since mixing in properties dirties the prototype chain by pretending it doesn't exist. There is also information loss about the type of object being mixed in. Collisions often occur and existing properties are overwritten, losing references to the original object properties or methods.

Trope mitigates these issues by making sure the prototype chain remains clean, overloaded methods can be accessed with `this.super.as`, and it is still possible to check the object instanceof relationship (indirectly).

The implementation required that dynamically created definitions be created on-the-fly so that a semantically *multiple inheritance* definition can be represented in JavaScript's *single inheritance* structure.

Refer to the [LoggingEventedCat](#LoggingEventedCat) example. The object `loggingEventedCat` does not inherit from `EventEmitter` but rather it inherits from the dynamically generated `[EventEmitter which inherits Logger]`. This allows for multiple parents to be normalized into a single, direct parent chain of Tropes. This is the reason using the native `instanceof` operator on objects created from multiple inheritance will not work, however the `Trope.instanceOf` function will return the correct relationship.

### Examples<a id="examples"></a>
* [Object factories](#object-factories)
* [Private properties](#private-properties)
* [Inheritance](#inheritance)
* [Multiple Inheritance](#multiple-inheritance)
* [Native JS Compatibility](#native-js-compatibility)

#### Object factories<a id="object-factories"></a>
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
If you want to initialize state when you create an object, you can pass in an *initializer function*.
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
You can also create new objects by calling the Trope directly as a function or constructor with `new`.
```javascript
greeter = Greeter.create('Bertrand');
greeter = Greeter('Bertrand');
greeter = new Greeter('Bertrand');
```

#### Private properties<a id="private-properties"></a>
You can define a Trope in `privacy` mode to prevent outside code from accessing or modifying object properties.
```javascript
var Greeter = Trope({ privacy: true }, function (name) {
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
You can still expose properties on the public interface by using `exports`.
```javascript
var Greeter = Trope({ privacy: true }, function (name) {
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
See how [private properties](#description-private-members) are implemented in Trope.

#### Inheritance<a id="inheritance"></a>
Start with an existing definition
```javascript
var Animal = Trope({
    getLongName: function () {
        return 'Animalia';
    }
});
```
Inherit from base definitions by chaining off of them with `turn` and passing in a new definition. You can overload functions and call the parent with `this.super()`.
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
The `instanceof` operator still works since Trope inheritance is based on JavaScript's native inheritance patterns.
```javascript
mammal instanceof Mammal;
mammal instanceof Vertebrate;
mammal instanceof Animal;
```

See how [this.super](#description-super) is implemented in Trope.

##### Multiple Inheritance<a id="multiple-inheritance"></a>
Assume existing definitions for `Logger` and `EventEmitter`.
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
Use `Logger` and `EventEmitter` to create `EventedLogger`, a composite Trope.
```javascript
var EventedLogger = Trope(Logger).turn(EventEmitter);

var eventedLogger = EventedLogger.create();
eventedLogger.on('logme', function (msg) {
    eventedLogger.log('LOGME: ' + msg);
});
eventedLogger.fire('logme', 'hello'); // logs 'LOGME: hello'
eventedLogger.fire('logme', 'world'); // logs 'LOGME: world'
```
Multiple inheritance can be a useful method of code reuse and can result in some interesting combinations of composite definitions.

For example, define a `Cat`.
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
<a id="LoggingEventedCat"></a>Inherit from `Logger`, `EventEmitter`, and `Cat` to define something completely different.
```javascript
var LoggingEventedCat = Trope(Logger).
    turn(EventEmitter).
    turn(Cat).
    turn(function (name) { // init function
        this.super.as(Cat)(name); // call the init function for `Cat`
        this.on('meow', function (sound) {
            console.log(this.name + ': ' + sound);
        });
    },{ // overload the `vocalize` method inherited from `Cat`
        vocalize: function (sound) {
            sound = sound || this.super.as(Cat)(); // call the overloaded method
            this.fire('meow', sound);
        }
    });

var loggingEventedCat = LoggingEventedCat.create('Raja');
loggingEventedCat.vocalize(); // logs 'Raja: Meow!'
loggingEventedCat.vocalize('Purr...'); // logs 'Raja: Purr...'
```
Yes, defining a `LoggingEventedCat` is entirely possible in Trope, but it's up to you to decide how useful these composites can be.

See how [multiple inheritance](#description-multiple-inheritance) and [this.super](#description-super) are implemented in Trope.

#### Native JS Compatibility<a id="native-js-compatibility"></a>
Trope is completely compatibility with native JavaScript constructors because Trope uses native JavaScript inheritance patterns in its implementation. This makes it easy to adopt for projects without having to modify existing code to conform to Trope.
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
Create a Trope out of `Shape` and immediately create a `Shape` object. `instanceof` still works since `Shape.prototype` is actually part of `triangle`'s prototype chain.
```javascript
var triangle = Trope(Shape).create(3);
triangle instanceof Shape; // true
```
Representing `Shape` as a Trope allows it the same features available to any other Trope. Chain off of it and pass in a definition to add functionality or specify state.
```javascript
var Quadrilateral = Trope(Shape).turn(function (opts) {
    this.sides = 4;
});

var quadrilateral = Quadrilateral.create();
quadrilateral instanceof Quadrilateral;
quadrilateral instanceof Shape;
quadrilateral.getSides(); // 4
```

## Usage
### Node
install with `npm`

    npm install --save trope
### Browser
install with `bower`

    bower install --save trope
*or* use directly as a script
```html
<script src="trope.js"></script>
```
### git
clone git reposity

    git clone https://git.whatever.com/trope
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
