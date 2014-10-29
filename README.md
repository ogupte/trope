# trope.js
## Description
Trope is awesome.
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

### Example
#### Inheritance Chain
```javascript
// Prototypes
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
pumbaa.getLongName(); // 'Animalia'

// Chaining prototypes

var Mammal = Animal.extend({
    getLongName: function () {
        return this.super() + ' Mammalia';
    }
});

pumbaa = Mammal.create(); // or `new Mammal()`
pumbaa.name = 'Pumbaa';
pumbaa.getLongName(); // 'Animalia Mammalia'

// Constructor functions

var Carnivore = Mammal.extend({
    constructor: function (name) {
        this.name = name;
    },
    getLongName: function () {
        return this.super() + ' Carnivora';
    }
});

pumbaa = Carnivore.create('Pumbaa'); // or `new Carnivore('Pumbaa')`
pumbaa.name === 'Pumbaa'; // true
pumbaa.getLongName(); // 'Animalia Mammalia Carnivora'

// Super functions

var Canine = Carnivore.extend({
    constructor: function (name) {
        this.super(name.toUpperCase());
    },
    getLongName: function () {
        return this.super() + ' Canis';
    }
});

pumbaa = Canine.create('Pumbaa'); // or `new Canine('Pumbaa')`
pumbaa.name === 'PUMBAA'; // true
pumbaa.getLongName(); // 'Animalia Mammalia Carnivora Canis'

// Private members

var Dog = Canine.extend({ privacy: true }, {
    constructor: function (name) {
        this.super(name);
        this.secret = 'shhhh...'; // this references the object's private state
    },
    getLongName: function () {
        return this.super() + ' familiaris';
    },
    shareSecret: function () {
        return this.secret;
    }
});

pumbaa = Dog.create('Pumbaa'); // or `new Dog('Pumbaa')`
pumbaa.name === 'PUMBAA'; // true
pumbaa.getLongName(); // 'Animalia Mammalia Carnivora Canis familiaris'
pumbaa.secret; // undefined
pumbaa.shareSecret(); // 'shhhh...'

// Protected members for inheriting Tropes

var Weiner = Dog.extend({ privacy: true }, {
    constructor: function (name) {
        this.super(name);
        this.secret += 'w00f!';
        this.exports.name = this.exports.name.toLowerCase(); // access public reference with exports property
    },
    getLongName: function () {
        return this.super() + ' (Dachshund)';
    }
});

pumbaa = Weiner.create('Pumbaa'); // or `new Weiner('Pumbaa')`
pumbaa.name === 'pumbaa'; // true
pumbaa.getLongName(); // 'Animalia Mammalia Carnivora Canis familiaris (Dachshund)'
pumbaa.secret; // undefined
pumbaa.shareSecret(); // 'shhhh...w00f!'
```
#### Multiple Inheritance Chain
```javascript

// vanilla JS EventEmitter implementation
function EventEmitter () {
    this.eventMap = {};
}
EventEmitter.prototype.on = function (name, handler) {
    if (this.eventMap[name] === undefined) {
        this.eventMap[name] = [];
    }
    this.eventMap[name].push(handler);
};
EventEmitter.prototype.emit = function (name) {
    var i;
    var args;
    if (this.eventMap[name]) {
        args = [];
        for (i=1; i<arguments.length; i++) {
            args.push(arguments[i]);
        }
        for (i=0; i<this.eventMap[name].length; i++) {
            this.eventMap[name][i].apply(this, args);
        }
    }
};

// Trope Logger implementation
var Logger = Trope({ privacy: true },
    function Logger (options) {
        this.prefix = options.prefix;
    }, {
        log: function (msg) {
            console.log(this.prefix + ': ' + msg);
        }
    });

// Combine all the above into 1 Trope
var LoggingEventedDog = Trope(EventEmitter)
    .extend(Logger)
    .extend(Dog)
    .extend({
        constructor: function (name) {
            this.super.as(Dog)(name);
            this.super.as(Logger)({ prefix: name });
            this.super.as(EventEmitter)();
            this.on('bark', function (noise) {
                this.log(noise);
            });
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

pumbaa = LoggingEventedDog.create('Pumbaa');
pumbaa.on('bark', function (noise) {
    if (noise === 'Woof!') {
        this.log(this.shareSecret());
    }
});

pumbaa.getLongName(); // 'Animalia Mammalia Carnivora Canis familiaris'
pumbaa.bark(); // 'PUMBAA: Bark!'
pumbaa.woof(); // 'PUMBAA: Woof!'
               // 'PUMBAA: shhhh...!'
pumbaa.secret; // undefined
pumbaa.ruff(); // 'PUMBAA: Ruff!'

Trope.instanceOf(pumbaa, Logger); // true
Trope.instanceOf(pumbaa, EventEmitter); // true
Trope.instanceOf(pumbaa, Dog); // true
Trope.instanceOf(pumbaa, Mammal); // true
Trope.instanceOf(pumbaa, Animal); // true
```

## Test
### Unit
Tests are in `mocha` using `chaijs`

    grunt test
or you can run test in the browser by opening `test/browser/test.html`

### Coverage
Run the code coverage report using `blanket`.

    grunt coverage
