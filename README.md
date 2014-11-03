# trope.js
## Description
Trope is an awesome way to define prototypes in JavaScript. [see examples](#examples)

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

### Examples
* [Simple Prototypes](#simple-prototypes)
* [Constructor Functions](#constructor-functions)
* [Native JS Compatability](#native-js-compatability)
* [Inheritance](#inheritance)
* [Private Members](#private-members)
* [Multiple Inheritance](#multiple-inheritance)

#### Simple Prototypes
```javascript
var Animal = Trope({
    getName: function () {
        return this.name || 'NoName';
    },
    getLongName: function () {
        return 'Animalia';
    }
});

var pumbaa = Animal.create(); // or `new Animal()`
pumbaa.name = 'Pumbaa';
pumbaa.getName(); // 'Pumbaa'
pumbaa.getLongName(); // 'Animalia'
```

#### Constructor Functions
You can set a constructor property on the prototype
```javascript
var Animal = Trope({
    constructor: function (name) {
        this.name = name;
    },
    getName: function () {
        return this.name || 'NoName';
    },
    getLongName: function () {
        return 'Animalia';
    }
});
```
or pass it in as a separate function
```javascript
var Animal = Trope(function (name) {
        this.name = name;
    }, {
    getName: function () {
        return this.name || 'NoName';
    },
    getLongName: function () {
        return 'Animalia';
    }
});
```
Arguments are passed into the `create` function or the `new` constructor.
```javascript
var pumbaa = Animal.create('Pumbaa'); // or `new Animal('Pumbaa')`
```
You can even leave off the prototype if you wanted.
```javascript
var Animal = Trope(function (name) {
    this.name = name;
});
```

#### Native JS Compatability
Create a Trope from a native JS definition.
```javascript
function NativeJSAnimal (name) {
    this.name = name;
}
NativeJSAnimal.prototype.getName = function () {
    return this.name || 'NoName';
};

var Animal = Trope(NativeJSAnimal);
var pumbaa = Animal.create('Pumbaa');
pumbaa.getName(); // 'Pumbaa'
```

#### Inheritance
Call `chain` on a Trope to extend the prototype chain with a new Trope.
```javascript
var Mammal = Animal.chain({
    getLongName: function () {
        return 'Mammalia';
    }
});
```
Use `this.super` to call parent methods.
```javascript
var Mammal = Animal.chain({
    getLongName: function () {
        return this.super() + ' Mammalia';
    }
});
var mammal = Mammal.create();
mammal.getLongName(); // 'Animalia Mammalia'
mammal instanceof Mammal; // true
mammal instanceof Animal; // true

```
You can also use `this.super` to call the parent constructor.
```javascript
var Mammal = Animal.chain({
    constructor: function (name) {
        this.super(name.toLowerCase());
    },
    getLongName: function () {
        return this.super() + ' Mammalia';
    }
});
Mammal.create('PuMbAa').getName(); // 'pumbaa'
```

#### Private Members
Use the `privacy` option to define a Trope in privacy mode
```javascript
var PrivateAnimal = Trope({ privacy: true }, {
    constructor: function () {
        this.secret = 'shhhh...'; // this references the object's private state
    },
    shareSecret: function () {
        return this.secret;
    }
});

var pumbaa = PrivateAnimal.create();
pumbaa.secret; // undefined
pumbaa.shareSecret(); // 'shhhh...'
```
In `privacy` mode, `this` will always refer to the object's private state, but you can still access the public reference with `this.exports`.
```javascript
var PrivateAnimal = Trope({ privacy: true }, {
    constructor: function (name) {
        this.secret = 'shhhh...'; // this references the object's private state
        this.exports.name = name;
    },
    shareSecret: function () {
        return this.secret;
    }
});

var pumbaa = PrivateAnimal.create('Pumbaa');
pumbaa.secret; // undefined
pumbaa.shareSecret(); // 'shhhh...'
pumbaa.name; // 'Pumbaa'
```
When you inherit a Trope that has `privacy` enabled, the new Trope will also default to `privacy` mode unless explicity set to `false`. If so, the new Trope will not have access to private members.
```javascript
var PublicMammal = PrivateAnimal.chain({ privacy: false }, {
    constructor: function (name) {
        this.super(name);
        this.secret; // undefined
    }
});

var pumbaa = PublicMammal.create('Pumbaa');
pumbaa.name; // 'Pumbaa'
pumbaa.secret; // undefined
pumbaa.shareSecret(); // 'shhhh...'
```

#### Multiple Inheritance
Native JS prototypes do not support multiple inheritance, but Trope has a way to get around this.

In this example, I have already defined `EventEmitter` (a native JS implementation), `Logger` (a Trope Logger implementation), and `Dog` (which has it's own inheritance chain `Dog` → `Canine` → `Carnivore` → `Mammal` → `Animal`).
```javascript
var LoggingEventedDog = Trope(EventEmitter)
    .chain(Logger)
    .chain(Dog)
    .chain({
        constructor: function (name) {
            this.super.as(Dog)(name);
            this.super.as(Logger)({ prefix: name });
            this.super.as(EventEmitter)();
        },
        bark: function () {
            this.emit('bark', 'Bark!');
        },
        woof: function () {
            this.emit('bark', 'Woof!');
        },
        ruff: function () {
            this.emit('bark', 'Ruff!');
        }
    });

var pumbaa = LoggingEventedDog.create('Pumbaa');
pumbaa.log(pumbaa.getLongName()) // 'Pumbaa: Animalia Mammalia Carnivora Canis familiaris'
pumbaa.on('bark', function (noise) {
    pumbaa.log(noise);
});
pumbaa.bark(); // 'Pumbaa: Bark!'
pumbaa.woof(); // 'Pumbaa: Woof!'
pumbaa.ruff(); // 'Pumbaa: Ruff!'

// all true:
Trope.instanceOf(pumbaa, Logger);
Trope.instanceOf(pumbaa, EventEmitter);
Trope.instanceOf(pumbaa, Dog);
Trope.instanceOf(pumbaa, Canine);
Trope.instanceOf(pumbaa, Carnivore);
Trope.instanceOf(pumbaa, Mammal);
Trope.instanceOf(pumbaa, Animal);
Trope.instanceOf(pumbaa, Object);
```
Notice that `this.super.as` is used to call any of the parent constructors. This also works for methods.

Normally, the native JS `instanceof` operator works but in this case, `Trope.instanceOf` is needed. This is because the object isn't really an `instanceof` `Logger`, it's actually an `instanceof` `[Logger which inherits EventEmitter]`, a dynamically generated Trope that gets around JavaScript's single inheritance restriction.

## Test
### Unit
Tests are in `mocha` using `chaijs`

    grunt test
or you can run test in the browser by opening `test/browser/test.html`

### Coverage
Run the code coverage report using `blanket`.

    grunt coverage
