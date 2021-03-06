'use strict';
/* jslint unused:false */
/* jslint undef:false */
/* globals describe,it,before,beforeEach,after,afterEach,xdescribe,xit */
/* jslint expr:true */

if (typeof require !== 'undefined') {
	if (typeof chai === 'undefined') {
		var chai = require('chai');
	}
	if (typeof Trope === 'undefined') {
		var Trope = require('../trope.js');
	}
}
var expect = chai.expect;

describe('Trope Static', function () {
	describe('Trope.define([definition])', function () {
		it('should return a Trope constructor function', function () {
			var definition = {
				someConfig: true
			};
			var TestTrope = Trope.define(definition);
			expect(TestTrope).to.be.a.function;
			expect(TestTrope).to.have.property('trope');
			var TestTropeInstance = TestTrope.trope;
			expect(TestTropeInstance).to.be.an.instanceOf(Trope.Trope);
			expect(TestTropeInstance).to.have.property('def');
			expect(TestTropeInstance.def).to.equal(definition);
		});
	});
	describe('Trope.interpret([*])', function () {
		it('should return a Trope constructor function', function () {
			var testPrototype = {
				someMethod: function () {}
			};
			var TestTrope = Trope.interpret(testPrototype);
			expect(TestTrope).to.be.a.function;
			expect(TestTrope).to.have.property('trope');
			var TestTropeInstance = TestTrope.trope;
			expect(TestTropeInstance).to.be.an.instanceOf(Trope.Trope);
			expect(TestTropeInstance).to.have.property('proto');
			expect(TestTropeInstance.proto).to.equal(testPrototype);
		});
	});
	describe('Trope.instanceOf', function () {
		var Organism = Trope.define({
			constructor: function Organism (name) {
				this.name = name;
			},
			prototype: {
				getLongName: function () {
					return 'Organism';
				}
			}
		});
		var Animal = Trope.define({
			inherits: Organism,
			constructor: function Animal (name) {
				this.super(name);
				this.kingdom = 'Animalia';
			},
			prototype: {
				getLongName: function () {
					return this.kingdom;
				}
			}
		});
		function NativeConstructor () {}

		it('should throw an error if it wasn\'t passed 2 arguments', function () {
			var animal = new Animal('Pumbaa');
			expect(function () {
				Trope.instanceOf();
			}).to.throw('Trope.instanceOf only supports 2 arguments');
			expect(function () {
				Trope.instanceOf(animal);
			}).to.throw('Trope.instanceOf only supports 2 arguments');
			expect(function () {
				Trope.instanceOf(animal, Animal, Organism);
			}).to.throw('Trope.instanceOf only supports 2 arguments');
		});
		it('should throw an error if it wasn\'t passed an function and an object', function () {
			var animal = new Animal('Pumbaa');
			expect(function () {
				Trope.instanceOf(animal, 'Animal');
			}).to.throw('Trope.instanceOf must have an OBJECT and FUNCTION as arguments');
			expect(function () {
				Trope.instanceOf(animal, {});
			}).to.throw('Trope.instanceOf must have an OBJECT and FUNCTION as arguments');
			expect(function () {
				Trope.instanceOf(Animal, Animal);
			}).to.throw('Trope.instanceOf must have an OBJECT and FUNCTION as arguments');
		});
		it('support trope constructors and native constructors', function () {
			var animal = new Animal('Pumbaa');
			var resultAnimal = Trope.instanceOf(animal, Animal);
			var testNativeObj = new NativeConstructor();
			var resultNative = Trope.instanceOf(testNativeObj, NativeConstructor);
			expect(resultAnimal).to.be.a.boolean;
			expect(resultAnimal).to.be.true;
			expect(resultNative).to.be.a.boolean;
			expect(resultNative).to.be.true;
			expect(Trope.instanceOf(testNativeObj, Animal)).to.be.false;
		});
	});
});

describe('Trope Instance', function () {
	var testPrototype = {};
	var testConstructor = function () {};
	var trope;
	var parentTrope;
	var childTrope;
	beforeEach(function () {
		trope = new Trope.Trope({
			prototype: testPrototype,
			constructor: testConstructor
		});
		var parentTropePrototype = Object.create({
			superParentMethod1: function () {},
			superParentMethod2: function () {},
			superParentMethod3: function () {}
		});
		parentTropePrototype.parentMethod1 = function () {};
		parentTropePrototype.parentMethod2 = function () {};
		parentTrope = new Trope.Trope({
			prototype: parentTropePrototype
		});
		childTrope = new Trope.Trope({
			inherits:parentTrope,
			prototype: {
				childMethod1: function () {},
				childMethod2: function () {}
			}
		});
	});
	it('should return the constructor of the Trope it\'s inheriting from', function () {
		var superConstructor = childTrope.getSuperConstructor();
		expect(superConstructor).to.be.a.function;
		expect(superConstructor).to.have.property('trope');
		expect(superConstructor.trope).to.equal(parentTrope);
	});
	describe('constructor([definition])', function () {
		it('should return a Trope instance object', function () {
			var trope = new Trope.Trope();
			expect(trope).to.be.an.instanceOf(Trope.Trope);
		});
	});
	describe('#getConstructor([isSuper])', function () {
		it('should return a Trope constructor function', function () {
			var TropeConstructor = trope.getConstructor();
			expect(TropeConstructor).to.be.a.function;
			expect(TropeConstructor).to.have.property('trope');
			expect(TropeConstructor.trope).to.equal(trope);
		});
	});
	describe('#buildProxyConstructor()', function () {
		it('should return a proxy constructor function', function () {
			var TropeProxyConstructor = trope.buildProxyConstructor();
			expect(TropeProxyConstructor).to.be.a.function;
			var obj = new TropeProxyConstructor();
			expect(obj).to.exist;
			expect(obj).to.be.an.instanceOf(TropeProxyConstructor);
		});
	});
	describe('#getPrototype()', function () {
		it('should return the prototype associated with the Trope object', function () {
			var proto = trope.getPrototype();
			expect(proto).to.equal(testPrototype);
		});
	});
	describe('#getSuperConstructor()', function () {
		it('should return the constructor of the Trope it\'s inheriting from', function () {
			var superConstructor = childTrope.getSuperConstructor();
			expect(superConstructor).to.be.a.function;
			expect(superConstructor).to.have.property('trope');
			expect(superConstructor.trope).to.equal(parentTrope);
		});
	});
	describe('#forEachTropeInChain(callback)', function () {
		it('should iterate through each Trope in the inheritance chain, starting with the root ancestor', function () {
			var tropeChainList = [];
			childTrope.forEachTropeInChain(function (currentTrope) {
				tropeChainList.push(currentTrope);
			});
			expect(tropeChainList).to.have.length(2);
			expect(tropeChainList[0]).to.equal(parentTrope);
			expect(tropeChainList[1]).to.equal(childTrope);
		});
	});
	describe('#forEachMethod(callback)', function () {
		it('should interate though each method function in the prototype chain in this trope\'s definition, starting with the root ancestor', function () {
			var tropeMethodList = [];
			parentTrope.forEachMethod(function (currentMethod, currentMethodName) {
				tropeMethodList.push(currentMethodName);
			});
			expect(tropeMethodList).to.have.length(5);

			var first3Methods = tropeMethodList.splice(0,3);
			var last2Methods = tropeMethodList;

			expect(first3Methods).to.include('superParentMethod1');
			expect(first3Methods).to.include('superParentMethod2');
			expect(first3Methods).to.include('superParentMethod3');
			expect(last2Methods).to.include('parentMethod1');
			expect(last2Methods).to.include('parentMethod2');
		});
	});
	describe('#createChildTrope([definition])', function () {
		it('should return a Trope instance object which inherits from this Trope', function () {
			var definition = {};
			var childTrope = parentTrope.createChildTrope(definition);
			expect(childTrope.inherits).to.equal(parentTrope);
			expect(childTrope.def).to.equal(definition);
		});
	});
	describe('#defineChild([definition])', function () {
		it('should return a Trope constructor function whose Trope inherits from this Trope', function () {
			var definition = {};
			var ChildTrope = parentTrope.defineChild(definition);
			expect(ChildTrope).to.be.a.function;
			expect(ChildTrope.trope.inherits).to.equal(parentTrope);
			expect(ChildTrope.trope.def).to.equal(definition);
		});
	});
	describe('#interpretChild([*])', function () {
		it('should return a Trope constructor function whose Trope inherits from this Trope', function () {
			var ChildTrope = parentTrope.interpretChild(testConstructor, testPrototype);
			expect(ChildTrope.trope.inherits).to.equal(parentTrope);
			expect(ChildTrope.trope.constr).to.equal(testConstructor);
			expect(ChildTrope.trope.proto).to.equal(testPrototype);
		});
	});
	describe('#getDefinition()', function () {
		it('should return a shallow copy of this trope\'s definition object', function () {
			var definition = parentTrope.getDefinition();
			expect(definition).to.deep.equal(parentTrope.def);
		});
	});
});

describe('Trope Usage', function () {
	describe('Creation', function () {
		describe('Trope constructor', function () {
			it('should create a Trope instance', function () {
				var nullTrope = new Trope.Trope();
				expect(nullTrope).to.be.an.instanceOf(Trope.Trope);
			});
			it('should return a constructor function with trope.getConstructor()', function () {
				var nullTrope = new Trope.Trope();
				var NullConstructor = nullTrope.getConstructor();
				expect(NullConstructor).to.be.a.function;
				expect(NullConstructor).to.have.property('prototype');
				expect(NullConstructor.prototype).to.equal(nullTrope.finalProto);
			});
		});
		describe('Trope.define', function () {
			it('should return a Trope constructor function', function () {
				var NullConstructor = Trope.define();
				expect(NullConstructor).to.be.a.function;
				expect(NullConstructor).to.have.property('prototype');
				expect(NullConstructor.prototype).to.equal(NullConstructor.trope.finalProto);
			});
		});
		describe('Trope.interpret', function () {
			it('should return a Trope constructor function', function () {
				var NullConstructor = Trope.interpret(null);
				expect(NullConstructor).to.be.a.function;
				expect(NullConstructor).to.have.property('prototype');
				expect(NullConstructor.prototype).to.equal(NullConstructor.trope.finalProto);
			});
			describe('0 arguments: ()', function () {
				it('should return a Trope constructor for an object with no prototype', function () {
					var NullConstructor = Trope.interpret();
					expect(NullConstructor).to.be.a.function;
					expect(NullConstructor).to.have.property('prototype');
					expect(NullConstructor.prototype).to.equal(NullConstructor.trope.finalProto);
					expect(Object.getPrototypeOf(NullConstructor.trope.finalProto)).to.be.null;
				});
			});
		});
		describe('chained from another Trope (trope.createChildTrope)', function () {
			it('should return a Trope constructor which inherits from the chained Trope object', function () {
				var nullTrope = new Trope.Trope();
				var childOfNullTrope = nullTrope.createChildTrope({
					type: 'ChildOfNull'
				});
				expect(childOfNullTrope).to.be.an.instanceOf(Trope.Trope);
				expect(childOfNullTrope.inherits).to.equal(nullTrope);
				expect(Object.getPrototypeOf(childOfNullTrope.finalProto)).to.equal(nullTrope.finalProto);
				expect(Object.getPrototypeOf(childOfNullTrope.finalProto).constructor).to.equal(nullTrope.constr);
			});
		});
	});

	describe('Compatability', function () {
		// JavaScript Native Constructor - Person
		var Person = (function () {
			function Person (name, age) {
				if (name) {
					this.setName(name);
				}
				if (age !== undefined) {
					this.setAge(age);
				}
			}
			Person.prototype.setName = function (name) {
				this.name = name;
			};
			Person.prototype.setAge = function (age) {
				this.age = age;
			};
			return Person;
		}());

		// prototype object for a Person
		var personPrototype = {
			init: function (name, age) {
				this.setName(name);
				this.setAge(age);
			},
			setName: function (name) {
				this.name = name;
			},
			setAge: function (age) {
				this.age = age;
			}
		};

		describe('using native constructor functions', function () {
			it('should create a Trope defined with a native constructor function', function () {
				var PersonTropeConstructor = Trope.define({
					constructor: Person
				});
				var person = new PersonTropeConstructor('Test Name', 99);
				expect(PersonTropeConstructor).to.be.a.function;
				expect(PersonTropeConstructor).to.have.property('prototype');
				expect(PersonTropeConstructor.prototype).to.equal(Person.prototype);
				expect(person).to.be.an.instanceOf(Person);
				expect(person).to.have.property('name');
				expect(person.name).to.equal('Test Name');
				expect(person).to.have.property('age');
				expect(person.age).to.equal(99);
			});
		});
		describe('using only prototype objects', function () {
			it('should create a Trope defined with a prototype object', function () {
				var Person = Trope.define({
					prototype: personPrototype
				});
				var person = new Person();
				person.init('Test Name', 99);
				expect(Person).to.be.a.function;
				expect(Person).to.have.property('prototype');
				expect(Person.prototype).to.equal(personPrototype);
				expect(person).to.be.an.instanceOf(Person);
				expect(person).to.have.property('name');
				expect(person.name).to.equal('Test Name');
				expect(person).to.have.property('age');
				expect(person.age).to.equal(99);
			});
		});
		describe('using Trope constructors', function () {
			// a Trope constructor
			var PersonTropeConstructor = Trope.define({
				constructor: Person
			});

			it('should create a Trope defined with another Trope constructor', function () {
				var XPersonTropeConstructor = Trope.define({
					constructor: PersonTropeConstructor
				});
				var person = new XPersonTropeConstructor('Test Name', 99);
				expect(XPersonTropeConstructor).to.be.a.function;
				expect(XPersonTropeConstructor).to.have.property('prototype');
				expect(XPersonTropeConstructor.prototype).to.equal(Person.prototype);
				expect(person).to.be.an.instanceOf(Person);
				expect(person).to.be.an.instanceOf(PersonTropeConstructor);
				expect(person).to.be.an.instanceOf(XPersonTropeConstructor);
				expect(person).to.have.property('name');
				expect(person.name).to.equal('Test Name');
				expect(person).to.have.property('age');
				expect(person.age).to.equal(99);
			});
		});
		/*xdescribe('using Trope objects', function () {
			// a Trope instance
			var personTrope = new Trope.Trope({
				constructor: Person
			});

			it('should create a Trope defined with another Trope instance', function () {
				var XPersonTropeConstructor = Trope.define({
					trope: personTrope
				});
			});
		});*/
	});

	describe('Instantiation', function () {
		var EventEmitter = Trope(function EventEmitter () {
			this.eventMap = {};
		}, {
			on: function (name, handler) {
				if (this.eventMap[name] === undefined) {
					this.eventMap[name] = [];
				}
				this.eventMap[name].push(handler);
			},
			emit: function (name) {
				var i;
				var args;
				if (this.eventMap[name]) {
					args = [];
					for (i=1; i<arguments.length; i++) {
						args.push(arguments[i]);
					}
					for (i=0; i<this.eventMap[name].length; i++) {
						this.eventMap[name][i].apply(this.exports, args);
					}
				}
			}
		});

		it('should be able to create an instance by calling the constructor function with the `new` operator', function () {
			var testStack = [];
			var ee = new EventEmitter();
			ee.on('go', function (val) {
				testStack.push(val);
			});
			ee.emit('go', 9);
			ee.emit('go', 99);
			ee.emit('go', 999);
			expect(ee).to.be.an.object;
			expect(ee).to.be.an.instanceOf(EventEmitter);
			expect(testStack).to.deep.equal([9,99,999]);
		});

		it('should be able to create an instance by calling the constructor function without the `new` operator', function () {
			var testStack = [];
			var ee = EventEmitter();
			ee.on('go', function (val) {
				testStack.push(val);
			});
			ee.emit('go', 9);
			ee.emit('go', 99);
			ee.emit('go', 999);
			expect(ee).to.be.an.object;
			expect(ee).to.be.an.instanceOf(EventEmitter);
			expect(testStack).to.deep.equal([9,99,999]);
		});

		it('should be able to create an instance by calling the `create` static function on the trope constructor', function () {
			var testStack = [];
			var ee = EventEmitter.create();
			ee.on('go', function (val) {
				testStack.push(val);
			});
			ee.emit('go', 9);
			ee.emit('go', 99);
			ee.emit('go', 999);
			expect(ee).to.be.an.object;
			expect(ee).to.be.an.instanceOf(EventEmitter);
			expect(testStack).to.deep.equal([9,99,999]);
		});
	});

	//Organism > Animal > Vertebrate > Mammal > Carnivore > Canine > Dog > Dachshund
	describe('Inheritance', function () {
		var Organism;
		var Animal;
		var Vertebrate;
		var Mammal;
		var Carnivore;
		var Canine;
		var Dog;
		var Breed;

		Organism = Trope.define({
			constructor: function Organism (name) {
				this.name = name;
			},
			prototype: {
				getLongName: function () {
					return 'Organism';
				}
			}
		});

		describe('shallow', function () {
			it('should support shallow (<3) inheritance chains', function () {
				Animal = Trope.define({
					inherits: Organism,
					constructor: function Animal (name) {
						this.super(name);
						this.kingdom = 'Animalia';
					},
					prototype: {
						getLongName: function () {
							return this.kingdom;
						}
					}
				});
				var animal = new Animal('Pumbaa');

				expect(animal).to.be.an.instanceOf(Organism);
				expect(animal).to.be.an.instanceOf(Animal);
				expect(animal).have.property('name');
				expect(animal.name).to.equal('Pumbaa');
				expect(animal).have.property('kingdom');
				expect(animal.kingdom).to.equal('Animalia');
				expect(animal.getLongName()).to.equal('Animalia');

				Vertebrate = Trope.define({
					inherits: Animal,
					constructor: function Vertebrate (name) {
						this.super(name);
						this.phylum = 'Chordata';
					},
					prototype: {
						getLongName: function () {
							return this.super() + ' ' + this.phylum;
						}
					}
				});
				var vertebrate = new Vertebrate('Pumbaa');

				expect(vertebrate).to.be.an.instanceOf(Organism);
				expect(vertebrate).to.be.an.instanceOf(Animal);
				expect(vertebrate).to.be.an.instanceOf(Vertebrate);
				expect(vertebrate).have.property('name');
				expect(vertebrate.name).to.equal('Pumbaa');
				expect(vertebrate).have.property('kingdom');
				expect(vertebrate.kingdom).to.equal('Animalia');
				expect(vertebrate).have.property('phylum');
				expect(vertebrate.phylum).to.equal('Chordata');
				expect(vertebrate.getLongName()).to.equal('Animalia Chordata');
			});
		});
		describe('deep', function () {
			it('should support deep (3+) inhertance chains', function () {
				Mammal = Trope.define({
					inherits: Vertebrate,
					constructor: function Mammal (name) {
						this.super(name);
						this.class = 'Mammalia';
					},
					prototype: {
						getLongName: function () {
							return this.super() + ' ' + this.class;
						}
					}
				});
				var mammal = new Mammal('Pumbaa');

				expect(mammal).to.be.an.instanceOf(Organism);
				expect(mammal).to.be.an.instanceOf(Animal);
				expect(mammal).to.be.an.instanceOf(Vertebrate);
				expect(mammal).to.be.an.instanceOf(Mammal);
				expect(mammal).have.property('name');
				expect(mammal.name).to.equal('Pumbaa');
				expect(mammal).have.property('kingdom');
				expect(mammal.kingdom).to.equal('Animalia');
				expect(mammal).have.property('phylum');
				expect(mammal.phylum).to.equal('Chordata');
				expect(mammal).have.property('class');
				expect(mammal.class).to.equal('Mammalia');
				expect(mammal.getLongName()).to.equal('Animalia Chordata Mammalia');

				Carnivore = Trope.define({
					inherits: Mammal,
					constructor: function Carnivore (name) {
						this.super(name);
						this.order = 'Carnivora';
					},
					prototype: {
						getLongName: function () {
							return this.super() + ' ' + this.order;
						}
					}
				});
				var carnivore = new Carnivore('Pumbaa');

				expect(carnivore).to.be.an.instanceOf(Organism);
				expect(carnivore).to.be.an.instanceOf(Animal);
				expect(carnivore).to.be.an.instanceOf(Vertebrate);
				expect(carnivore).to.be.an.instanceOf(Mammal);
				expect(carnivore).to.be.an.instanceOf(Carnivore);
				expect(carnivore).have.property('name');
				expect(carnivore.name).to.equal('Pumbaa');
				expect(carnivore).have.property('kingdom');
				expect(carnivore.kingdom).to.equal('Animalia');
				expect(carnivore).have.property('phylum');
				expect(carnivore.phylum).to.equal('Chordata');
				expect(carnivore).have.property('class');
				expect(carnivore.class).to.equal('Mammalia');
				expect(carnivore).have.property('order');
				expect(carnivore.order).to.equal('Carnivora');
				expect(carnivore.getLongName()).to.equal('Animalia Chordata Mammalia Carnivora');

				Canine = Trope.define({
					inherits: Carnivore,
					constructor: function Canine (name) {
						this.super(name);
						this.genus = 'Canis';
					},
					prototype: {
						getLongName: function () {
							return this.super() + ' ' + this.genus;
						}
					}
				});
				var canine = new Canine('Pumbaa');

				expect(canine).to.be.an.instanceOf(Organism);
				expect(canine).to.be.an.instanceOf(Animal);
				expect(canine).to.be.an.instanceOf(Vertebrate);
				expect(canine).to.be.an.instanceOf(Mammal);
				expect(canine).to.be.an.instanceOf(Carnivore);
				expect(canine).to.be.an.instanceOf(Canine);
				expect(canine).have.property('name');
				expect(canine.name).to.equal('Pumbaa');
				expect(canine).have.property('kingdom');
				expect(canine.kingdom).to.equal('Animalia');
				expect(canine).have.property('phylum');
				expect(canine.phylum).to.equal('Chordata');
				expect(canine).have.property('class');
				expect(canine.class).to.equal('Mammalia');
				expect(canine).have.property('order');
				expect(canine.order).to.equal('Carnivora');
				expect(canine).have.property('genus');
				expect(canine.genus).to.equal('Canis');
				expect(canine.getLongName()).to.equal('Animalia Chordata Mammalia Carnivora Canis');

				Dog = Trope.define({
					inherits: Canine,
					constructor: function Dog (name) {
						this.super(name);
						this.species = 'familiaris';
					},
					prototype: {
						getLongName: function () {
							return this.super() + ' ' + this.species;
						}
					}
				});
				var dog = new Dog('Pumbaa');

				expect(dog).to.be.an.instanceOf(Organism);
				expect(dog).to.be.an.instanceOf(Animal);
				expect(dog).to.be.an.instanceOf(Vertebrate);
				expect(dog).to.be.an.instanceOf(Mammal);
				expect(dog).to.be.an.instanceOf(Carnivore);
				expect(dog).to.be.an.instanceOf(Canine);
				expect(dog).to.be.an.instanceOf(Dog);
				expect(dog).have.property('name');
				expect(dog.name).to.equal('Pumbaa');
				expect(dog).have.property('kingdom');
				expect(dog.kingdom).to.equal('Animalia');
				expect(dog).have.property('phylum');
				expect(dog.phylum).to.equal('Chordata');
				expect(dog).have.property('class');
				expect(dog.class).to.equal('Mammalia');
				expect(dog).have.property('order');
				expect(dog.order).to.equal('Carnivora');
				expect(dog).have.property('genus');
				expect(dog.genus).to.equal('Canis');
				expect(dog).have.property('species');
				expect(dog.species).to.equal('familiaris');
				expect(dog.getLongName()).to.equal('Animalia Chordata Mammalia Carnivora Canis familiaris');

				Breed = Trope.define({
					inherits: Dog,
					constructor: function Breed (name) {
						this.super(name);
						this.breed = 'Dachshund';
					},
					prototype: {
						getLongName: function () {
							return this.super() + ' (' + this.breed + ')';
						}
					}
				});
				var breed = new Breed('Pumbaa');

				expect(breed).to.be.an.instanceOf(Organism);
				expect(breed).to.be.an.instanceOf(Animal);
				expect(breed).to.be.an.instanceOf(Vertebrate);
				expect(breed).to.be.an.instanceOf(Mammal);
				expect(breed).to.be.an.instanceOf(Carnivore);
				expect(breed).to.be.an.instanceOf(Canine);
				expect(breed).to.be.an.instanceOf(Dog);
				expect(breed).to.be.an.instanceOf(Breed);
				expect(breed).have.property('name');
				expect(breed.name).to.equal('Pumbaa');
				expect(breed).have.property('kingdom');
				expect(breed.kingdom).to.equal('Animalia');
				expect(breed).have.property('phylum');
				expect(breed.phylum).to.equal('Chordata');
				expect(breed).have.property('class');
				expect(breed.class).to.equal('Mammalia');
				expect(breed).have.property('order');
				expect(breed.order).to.equal('Carnivora');
				expect(breed).have.property('genus');
				expect(breed.genus).to.equal('Canis');
				expect(breed).have.property('species');
				expect(breed.species).to.equal('familiaris');
				expect(breed).have.property('breed');
				expect(breed.breed).to.equal('Dachshund');
				expect(breed.getLongName()).to.equal('Animalia Chordata Mammalia Carnivora Canis familiaris (Dachshund)');
			});
		});
		describe('multiple', function () {
			var EventEmitter = Trope({
				privacy: true
			}, function EventEmitter () {
				this.eventMap = {};
			}, {
				on: function (name, handler) {
					if (this.eventMap[name] === undefined) {
						this.eventMap[name] = [];
					}
					this.eventMap[name].push(handler);
				},
				emit: function (name) {
					var i;
					var args;
					if (this.eventMap[name]) {
						args = [];
						for (i=1; i<arguments.length; i++) {
							args.push(arguments[i]);
						}
						for (i=0; i<this.eventMap[name].length; i++) {
							this.eventMap[name][i].apply(this.exports, args);
						}
					}
				}
			});

			var Logger = Trope({
				privacy: true
			}, function Logger (prefix) {
				this.prefix = prefix;
			}, {
				log: function (msg) {
					console.log(this.prefix + ': ' + msg);
				}
			});

			it('should support multiple inheritance by proxying parents into the current inheritance chain', function (done) {
				try {
					var LoggingEventedDog = Trope(EventEmitter).turn(Logger).turn(Dog).turn({
						constructor: function LoggingEventedDog(name) {
							this.super.as(EventEmitter)();
							this.super.as(Logger)(name);
							this.super.as(Dog)(name);
						}
					});
					var loggingEventedDog = new LoggingEventedDog('Pumbaa');
					loggingEventedDog.on('log', function (msg) {
						expect(msg).to.equal('w000f!!');
						done();
					});
					expect(loggingEventedDog.getLongName()).to.equal('Animalia Chordata Mammalia Carnivora Canis familiaris');
					loggingEventedDog.emit('log', 'w000f!!');
				} catch (err) {
					done(err);
				}
			});

			it('should have Trope.instanceOf work for Tropes using multiple inheritance', function () {
				var LoggingEventedDog = Trope(EventEmitter).turn(Logger).turn(Dog).turn({
					constructor: function LoggingEventedDog(name) {
						this.super.as(EventEmitter)();
						this.super.as(Logger)(name);
						this.super.as(Dog)(name);
					}
				});
				var loggingEventedDog = new LoggingEventedDog('Pumbaa');
				expect(loggingEventedDog).to.be.an.instanceOf(EventEmitter); // works because it is at the root of the chain
				//these don't work because this isn't true multiple inheritance
				//e.g. it's not an instance of 'Logger', it is an instance of 'Logger that extends EventEmitter'
				// expect(loggingEventedDog).to.be.an.instanceOf(Logger);
				// expect(loggingEventedDog).to.be.an.instanceOf(Animal);
				// expect(loggingEventedDog).to.be.an.instanceOf(Organism);
				//instead use this:
				expect(Trope.instanceOf(loggingEventedDog, Logger)).to.be.true;
				expect(Trope.instanceOf(loggingEventedDog, Animal)).to.be.true;
				expect(Trope.instanceOf(loggingEventedDog, Organism)).to.be.true;
			});
			
			it('should support multiple inheritance by passing an array of tropes into definition', function (done) {
				try {
					var LoggingEventedDog = Trope.define({
						inherits: [EventEmitter, Logger, Dog],
						constructor: function LoggingEventedDog (name) {
							this.super.as(EventEmitter)();
							this.super.as(Logger)(name);
							this.super.as(Dog)(name);
						}
					});
					var loggingEventedDog = new LoggingEventedDog('Pumbaa');
					loggingEventedDog.on('log', function (msg) {
						expect(msg).to.equal('w000f!!');
						done();
					});
					expect(loggingEventedDog.getLongName()).to.equal('Animalia Chordata Mammalia Carnivora Canis familiaris');
					loggingEventedDog.emit('log', 'w000f!!');
					// check instance of
					expect(loggingEventedDog).to.be.an.instanceOf(EventEmitter); // works because it is at the root of the chain
					expect(Trope.instanceOf(loggingEventedDog, Logger)).to.be.true;
					expect(Trope.instanceOf(loggingEventedDog, Animal)).to.be.true;
					expect(Trope.instanceOf(loggingEventedDog, Organism)).to.be.true;
				} catch (err) {
					done(err);
				}
			});
			
			it('should support multiple inheritance by passing an array of tropes into interpret function', function (done) {
				try {
					var LoggingEventedDog = Trope.interpret([EventEmitter, Logger, Dog], function LoggingEventedDog (name) {
						this.super.as(EventEmitter)();
						this.super.as(Logger)(name);
						this.super.as(Dog)(name);
					});
					var loggingEventedDog = new LoggingEventedDog('Pumbaa');
					loggingEventedDog.on('log', function (msg) {
						expect(msg).to.equal('w000f!!');
						done();
					});
					expect(loggingEventedDog.getLongName()).to.equal('Animalia Chordata Mammalia Carnivora Canis familiaris');
					loggingEventedDog.emit('log', 'w000f!!');
					// check instance of
					expect(loggingEventedDog).to.be.an.instanceOf(EventEmitter); // works because it is at the root of the chain
					expect(Trope.instanceOf(loggingEventedDog, Logger)).to.be.true;
					expect(Trope.instanceOf(loggingEventedDog, Animal)).to.be.true;
					expect(Trope.instanceOf(loggingEventedDog, Organism)).to.be.true;
				} catch (err) {
					done(err);
				}
			});
		});
	});

	describe('Configuration: useSuper', function () {
		describe('default config value', function () {
			it('should default to false when no definition is passed in', function () {
				var nullTrope = new Trope.Trope();
				expect(nullTrope).to.be.an.instanceOf(Trope.Trope);
				expect(nullTrope).to.have.property('useSuper', false);
			});
			it('should default to true when not specified in the given definition', function () {
				var nullTrope = new Trope.Trope({});
				expect(nullTrope).to.be.an.instanceOf(Trope.Trope);
				expect(nullTrope).to.have.property('useSuper', true);
			});
		});
		describe('useSuper: true', function () {
			describe('simple', function () {
				var Organism = Trope.define({
					useSuper: true,
					constructor: function Organism (name) {
						this.name = name;
					},
					prototype: {
						getLongName: function () {
							return 'Organism';
						}
					}
				});
				it('should create a Trope which has a super accessor in the constructor and any overwritten methods', function () {
					var Animal = Trope.define({
						useSuper: true,
						inherits: Organism,
						constructor: function Animal (name) {
							expect(this.super).to.exist;
							this.super(name);
							this.kingdom = 'Animalia';
						},
						prototype: {
							getLongName: function () {
								expect(this.super).to.exist;
								return this.kingdom;
							}
						}
					});
					var animal = new Animal('Pumbaa');
					animal.getLongName();
				});
			});
			describe('with inheritance', function () {
				describe('homogeneous (all parents have useSuper set to true in their definitions) & mixed (parents have both true and false values for useSuper in their defintions)', function () {
					it('should make super available to the constructors and all overwritten methods in the inheritance chain except the root', function () {
						var Organism = Trope.define({
							useSuper: true,
							constructor: function Organism (name) {
								this.name = name;
							},
							prototype: {
								getLongName: function () {
									expect(this.super).to.not.exist;
									return 'Organism';
								}
							}
						});
						var Animal = Trope.define({
							useSuper: true,
							inherits: Organism,
							constructor: function Animal (name) {
								expect(this.super).to.exist;
								this.super(name);
								this.kingdom = 'Animalia';
							},
							prototype: {
								getLongName: function () {
									expect(this.super).to.exist;
									var superMethodReturns = this.super();
									return this.kingdom;
								}
							}
						});
						var animal = new Animal('Pumbaa');
						animal.getLongName();
					});
				});
			});
			describe('this.super.as(Trope)', function () {
				it('should call the constructor of given Trope and apply it to the current object',function () {
					var Organism = Trope.define({
						useSuper: true,
						constructor: function Organism (name) {
							this.name = name;
						},
						prototype: {
							getLongName: function () {
								expect(this.super).to.not.exist;
								return 'Organism';
							}
						}
					});
					var Animal = Trope.define({
						useSuper: true,
						inherits: Organism,
						constructor: function Animal (name) {
							expect(this.super).to.exist;
							expect(this.super).to.have.property('as');
							this.super.as(Organism)(name);
							expect(this.name).to.equal(name);
							this.kingdom = 'Animalia';
						},
						prototype: {
							getLongName: function () {
								return this.kingdom;
							}
						}
					});
					var animal = new Animal('Pumbaa');
				});
				it('should call the method of given Trope and apply it to the current object',function () {
					var Biota = Trope.define({
						prototype: {
							getLongName: function () {
								expect(this.super).to.not.exist;
								return 'Organic Agents';
							}
						}
					});
					var Organism = Trope.define({
						useSuper: true,
						inherits: Biota,
						constructor: function Organism (name) {
							this.name = name;
						},
						prototype: {
							getLongName: function () {
								expect(this.super()).to.equal('Organic Agents');
								return 'Organism';
							}
						}
					});
					var Animal = Trope.define({
						useSuper: true,
						inherits: Organism,
						constructor: function Animal (name) {
							this.kingdom = 'Animalia';
						},
						prototype: {
							getLongName: function () {
								expect(this.super).to.exist;
								var superMethodReturns = this.super.as(Organism)();
								expect(superMethodReturns).to.equal('Organism');
								return this.kingdom;
							}
						}
					});
					var animal = new Animal('Pumbaa');
					animal.getLongName();
				});
			});
		});
		describe('useSuper: false', function () {
			describe('simple', function () {
				var Organism = Trope.define({
					useSuper: false,
					constructor: function Organism (name) {
						this.name = name;
					},
					prototype: {
						getLongName: function () {
							return 'Organism';
						}
					}
				});
				it('should create a Trope which does not use a super accessor in the constructor or any overwritten methods', function () {
					var Animal = Trope.define({
						useSuper: false,
						inherits: Organism,
						constructor: function Animal (name) {
							expect(this.super).to.not.exist;
							Organism.trope.constr.call(this, name);
							this.kingdom = 'Animalia';
						},
						prototype: {
							getLongName: function () {
								expect(this.super).to.not.exist;
								return this.kingdom;
							}
						}
					});
					var animal = new Animal('Pumbaa');
					animal.getLongName();
				});
			});
			describe('with inheritance', function () {
				describe('homogeneous', function () {
					it('should create a Trope which does not use a super accessor in any of the constructors in the inheritance chain or overwritten methods', function () {
						var Organism = Trope.define({
							useSuper: false,
							constructor: function Organism (name) {
								expect(this.super).to.not.exist;
								this.name = name;
							},
							prototype: {
								getLongName: function () {
									expect(this.super).to.not.exist;
									return 'Organism';
								}
							}
						});
						var Animal = Trope.define({
							useSuper: false,
							inherits: Organism,
							constructor: function Animal (name) {
								expect(this.super).to.not.exist;
								Organism.trope.constr.call(this, name);
								this.kingdom = 'Animalia';
							},
							prototype: {
								getLongName: function () {
									expect(this.super).to.not.exist;
									return this.kingdom;
								}
							}
						});
						var animal = new Animal('Pumbaa');
						animal.getLongName();
					});
				});
				describe('mixed (parents have both true and false values for useSuper in their defintions)', function () {
					var console_warn = console.warn;
					function stubConsoleWarn(stubFunc, replace) {
						console.warn = function () {
							stubFunc.apply(console, arguments);
							if (!replace) {
								return console_warn.apply(console, arguments);
							}
						};
					}
					function resetConsoleWarn() {
						console.warn = console_warn;
					}

					it('should make super available to all constructors in the inheritance chain and overwritten methods except the root', function () {
						stubConsoleWarn(function (message) {
							expect(message).to.equal('useSuper {Vertebrate} must be same as parent {Animal} (defaults to true)!');
						}, true);
						var Organism = Trope.define({
							useSuper: false,
							constructor: function Organism (name) {
								expect(this.super).to.not.exist;
								this.name = name;
							},
							prototype: {
								getLongName: function () {
									expect(this.super).to.not.exist;
									return 'Organism';
								}
							}
						});
						var Animal = Trope.define({
							useSuper: true,
							inherits: Organism,
							constructor: function Animal (name) {
								expect(this.super).to.exist;
								this.super(name);
								this.kingdom = 'Animalia';
							},
							prototype: {
								getLongName: function () {
									expect(this.super).to.exist;
									var superMethodReturns = this.super();
									return this.kingdom;
								}
							}
						});
						var Vertebrate = Trope.define({
							useSuper: false,
							inherits: Animal,
							constructor: function Vertebrate (name) {
								expect(this.super).to.exist;
								this.super(name);
								this.phylum = 'Chordata';
							},
							prototype: {
								getLongName: function () {
									expect(this.super).to.exist;
									return this.super() + ' ' + this.phylum;
								}
							}
						});
						var vertebrate = new Vertebrate('Pumbaa');
						vertebrate.getLongName();
					});

					after(function () {
						resetConsoleWarn();
					});
				});
			});
		});
	});

	describe('Configuration: privacy', function () {
		var TropeWithPrivacy = new Trope.Trope({
			privacy: true,
			constructor: function () {
				this.secret = 'property of the private context';
			}
		});
		var TropeWithoutPrivacy = new Trope.Trope({
			privacy: false,
			constructor: function () {
				this.notSecret = 'property of the public context';
			}
		});

		describe('default config value', function () {
			it('should default to false when not specified in the given definition and it doesn\'t inherit', function () {
				var ATrope = new Trope.Trope({});
				expect(ATrope).to.have.property('isPrivate', false);
			});
			it('should default to false even if the parent definition has privacy: true', function () {
				var ATrope = new Trope.Trope({ inherits: TropeWithPrivacy });
				var BTrope = new Trope.Trope({ inherits: TropeWithoutPrivacy });
				expect(ATrope).to.have.property('isPrivate', false);
				expect(BTrope).to.have.property('isPrivate', false);
			});
		});
		describe('privacy: true', function () {
			describe('simple', function () {
				it('should create a Trope in which the constructor and methods access the private context with `this` and the public context with `this.exports`', function () {
					var closedBookThisContext;
					var closedBookExportsContext;
					var ClosedBook = Trope.define({
						privacy: true,
						constructor: function ClosedBook () {
							closedBookThisContext = this;
							closedBookExportsContext = this.exports;
							this.secret = 'property of the private context';
							this.exports.notSecret = 'property of the public context';
							this.readFrom();
						},
						prototype: {
							readFrom: function () {
								expect(this).to.equal(closedBookThisContext);
							},
							getSecret: function () {
								return this.secret;
							}
						}
					});
					var closedBookPublicContext = new ClosedBook();
					expect(closedBookPublicContext).to.not.equal(closedBookThisContext);
					expect(closedBookPublicContext).to.equal(closedBookExportsContext);
					expect(closedBookPublicContext).to.have.property('notSecret', 'property of the public context');
					expect(closedBookPublicContext).to.not.have.property('secret');
					expect(closedBookPublicContext.getSecret()).to.equal('property of the private context');
				});
			});
			describe('with inheritance', function () {
				describe('Homogeneous (all parents have privacy set to true in their definitions)', function () {
					var HomogeneousPrivacyTrope = new Trope.Trope({
						inherits: TropeWithPrivacy,
						privacy: true
					});
					it('should create a Trope in which all constructors and methods access the private context with `this` and the public context with `this.exports`', function () {
						var closedBookThisContext;
						var closedBookExportsContext;
						var ClosedBook = Trope.define({
							privacy: true,
							inherits: HomogeneousPrivacyTrope,
							constructor: function ClosedBook () {
								closedBookThisContext = this;
								closedBookExportsContext = this.exports;
								this.secret = 'property of the private context';
								this.exports.notSecret = 'property of the public context';
								this.readFrom();
							},
							prototype: {
								readFrom: function () {
									expect(this).to.equal(closedBookThisContext);
								},
								getSecret: function () {
									return this.secret;
								}
							}
						});
						var closedBookPublicContext = new ClosedBook();
						expect(closedBookPublicContext).to.not.equal(closedBookThisContext);
						expect(closedBookPublicContext).to.equal(closedBookExportsContext);
						expect(closedBookPublicContext).to.have.property('notSecret', 'property of the public context');
						expect(closedBookPublicContext).to.not.have.property('secret');
						expect(closedBookPublicContext.getSecret()).to.equal('property of the private context');
					});
				});
				describe('Mixed (parents have both true and false values for privacy in their defintions)', function () {
					it('should create a Trope in which those constructors and methods whose definitions have privacy set to false are not able to access the private context and can access the public context with `this` and those constructors and methods whose definitions have privacy set to true are able to access the private context with `this` and the public context with `this.exports`', function () {
						var bookThisContext;
						var Book = Trope.define({
							privacy: false,
							constructor: function Book () {
								bookThisContext = this;
								this.baseBookProperty = true;
								this.readFromBook();
							},
							prototype: {
								readFromBook: function () {
									expect(this).to.equal(bookThisContext);
								}
							}
						});


						var closedBookThisContext;
						var closedBookExportsContext;
						var ClosedBook = Trope.define({
							privacy: true,
							inherits: Book,
							constructor: function ClosedBook () {
								this.super();
								closedBookThisContext = this;
								closedBookExportsContext = this.exports;
								this.secret = 'property of the private context';
								this.exports.notSecret = 'property of the public context';
								this.readFromClosedBook();
							},
							prototype: {
								readFromClosedBook: function () {
									expect(this).to.equal(closedBookThisContext);
								},
								getSecret: function () {
									return this.secret;
								}
							}
						});
						var closedBookPublicContext = new ClosedBook();

						expect(closedBookPublicContext).to.not.equal(closedBookThisContext);
						expect(closedBookPublicContext).to.equal(closedBookExportsContext);
						expect(closedBookPublicContext).to.equal(bookThisContext);
						expect(closedBookPublicContext).to.have.property('notSecret', 'property of the public context');
						expect(closedBookPublicContext).to.not.have.property('secret');
						expect(closedBookPublicContext.getSecret()).to.equal('property of the private context');
						expect(closedBookPublicContext).to.have.property('baseBookProperty', true);

					});
				});
			});
		});
		describe('privacy: false', function () {
			describe('simple', function () {
				it('should create a Trope in which the constructor and methods access the public context with `this`', function () {
					var openBookThisContext;
					var OpenBook = Trope.define({
						privacy: false,
						constructor: function OpenBook () {
							openBookThisContext = this;
							this.readFrom();
						},
						prototype: {
							readFrom: function () {
								expect(this).to.equal(openBookThisContext);
							}
						}
					});
					var openBookPublicContext = new OpenBook();
					expect(openBookPublicContext).to.equal(openBookThisContext);
				});
			});
			describe('with inheritance', function () {
				describe('Homogeneous (all parents have privacy set to false in their definitions)', function () {
					it('should create a Trope in which all constructors and methods access the public context with `this`', function () {
						var bookThisContext;
						var Book = Trope.define({
							privacy: false,
							constructor: function Book () {
								bookThisContext = this;
								this.readFromBook();
							},
							prototype: {
								readFromBook: function () {
									expect(this).to.equal(bookThisContext);
								}
							}
						});

						var openBookThisContext;
						var OpenBook = Trope.define({
							privacy: false,
							inherits: Book,
							constructor: function OpenBook () {
								this.super();
								openBookThisContext = this;
								this.readFromOpenBook();
							},
							prototype: {
								readFromOpenBook: function () {
									expect(this).to.equal(openBookThisContext);
								}
							}
						});
						var openBookPublicContext = new OpenBook();
						expect(openBookPublicContext).to.equal(openBookThisContext);
						expect(openBookPublicContext).to.equal(bookThisContext);
					});
				});
				describe('Mixed (parents have both true and false values for privacy in their defintions)', function () {
					it('should create a Trope in which those constructors and methods whose definitions have privacy set to false are not able to access the private context and can access the public context with `this` and those constructors and methods whose definitions have privacy set to true are able to access the private context with `this` and the public context with `this.exports`', function () {
						var bookThisContext;
						var bookExportsContext;
						var Book = Trope.define({
							privacy: true,
							constructor: function Book () {
								bookThisContext = this;
								bookExportsContext = this.exports;
								this.secret = 'property of the private context';
								this.exports.notSecret = 'property of the public context';
								this.readFromBook();
							},
							prototype: {
								readFromBook: function () {
									expect(this).to.equal(bookThisContext);
								},
								getSecret: function () {
									return this.secret;
								}
							}
						});

						var openBookThisContext;
						var OpenBook = Trope.define({
							privacy: false,
							inherits: Book,
							constructor: function OpenBook () {
								this.super();
								openBookThisContext = this;
								this.readFromOpenBook();
							},
							prototype: {
								readFromOpenBook: function () {
									expect(this).to.equal(openBookThisContext);
								}
							}
						});

						var openBookPublicContext = new OpenBook();

						expect(openBookPublicContext).to.equal(openBookThisContext);
						expect(openBookPublicContext).to.not.equal(bookThisContext);
						expect(openBookPublicContext).to.equal(bookExportsContext);
						expect(openBookPublicContext).to.have.property('notSecret', 'property of the public context');
						expect(openBookPublicContext).to.not.have.property('secret');
						expect(openBookPublicContext.getSecret()).to.equal('property of the private context');
					});
				});
			});
		});
	});

	describe('Configuration: private', function () {
		describe('adding private methods', function () {
			describe('basic', function () {
				it('should have methods which are private', function () {
					var Calculator = Trope.define({
						constructor: function Calculator () {
							this.reset();
						},
						private: {
							reset: function () {
								this.evaluated = false;
								this.firstNumber = '';
								this.secondNumber = '';
								this.operation = null;
								this.result = null;
								this.exports.display = '';
							},
							ensureValid: function () {
								var validNumRgx = /^-?(\d)*\.?(\d)+$/;
								if (this.operation) {
									return validNumRgx.test(this.firstNumber) && validNumRgx.test(this.secondNumber);
								} else {
									return false;
								}
							},
							updateDisplay: function () {
								if (this.evaluated) {
									this.exports.display = this.result.toString(10);
								} else {
									if (this.operation === null) {
										this.exports.display = this.firstNumber;
									} else {
										this.exports.display = this.firstNumber + ' ' + this.operation + ' ' + this.secondNumber;
									}
								}
							}
						},
						prototype: {
							enterNumber: function (numberChar) {
								if (this.evaluated) {
									this.reset();
								}
								if (this.operation === null) {
									this.firstNumber += numberChar;
								} else {
									this.secondNumber += numberChar;
								}
								this.updateDisplay();
							},
							selectAdd: function () {
								this.operation = '+';
								this.updateDisplay();
							},
							evaluate: function () {
								if (this.ensureValid()) {
									var firstNumber = parseFloat(this.firstNumber, 10);
									var secondNumber = parseFloat(this.secondNumber, 10);
									if (this.operation === '+') {
										this.result = firstNumber + secondNumber;
									}
									this.evaluated = true;
									this.updateDisplay();
								} else {
									this.reset();
									this.exports.display = 'ERR';
								}
							},
							clear: function () {
								this.reset();
							}
						}
					});
					var calculator = Calculator.create();
					calculator.enterNumber('3');
					expect(calculator.display).to.equal('3');
					calculator.enterNumber('2');
					expect(calculator.display).to.equal('32');
					calculator.selectAdd();
					expect(calculator.display).to.equal('32 + ');
					calculator.enterNumber('1');
					expect(calculator.display).to.equal('32 + 1');
					calculator.enterNumber('0');
					expect(calculator.display).to.equal('32 + 10');
					calculator.evaluate();
					expect(calculator.display).to.equal('42');
					calculator.clear();
					expect(calculator.display).to.equal('');


					expect(calculator).to.not.have.property('reset');
					expect(calculator).to.not.have.property('ensureValid');
					expect(calculator).to.not.have.property('updateDisplay');
					expect(calculator).to.not.have.property('evaluated');
					expect(calculator).to.not.have.property('firstNumber');
					expect(calculator).to.not.have.property('secondNumber');
					expect(calculator).to.not.have.property('operation');
					expect(calculator).to.not.have.property('result');
					expect(calculator).to.have.property('display');
					expect(calculator.display).to.be.a.string;
					expect(calculator).to.have.property('enterNumber');
					expect(calculator.enterNumber).to.be.a.function;
					expect(calculator).to.have.property('selectAdd');
					expect(calculator.selectAdd).to.be.a.function;
					expect(calculator).to.have.property('evaluate');
					expect(calculator.evaluate).to.be.a.function;
					expect(calculator).to.have.property('clear');
					expect(calculator.clear).to.be.a.function;
				});
			});
			describe('with inheritance', function () {
				it('should work', function () {
					var User = Trope.define({
						constructor: function (username, features) {
							this.features = features;
							this.username = username;
						},
						private: {
							hasPermission: function (feature) {
								var i;
								for (i=0; i<this.features.length; i++) {
									if (this.features[i] === feature) {
										return true;
									}
								}
								return false;
							},
							getName: function () {
								return this.username;
							}
						},
						prototype: {
							canIUse: function (feature) {
								return this.hasPermission(feature);
							},
							getDisplayName: function () {
								return this.getName();
							}
						}
					});
					var Admin = User.turn({
						__TROPEDEF__: true,
						constructor: function (username) {
							this.super(username, []);
						},
						private: {
							hasPermission: function (feature) {
								return true;
							},
							getName: function () {
								return this.super() + ' (ADMIN)';
							}
						},
						prototype: {
							canIUse: function (feature) {
								return this.hasPermission(feature);
							}
						}
					});
					var user = User.create('user1234', ['api-read', 'reporting', 'comments']);
					var admin = Admin.create('user1234');
					expect(user.canIUse('api-read')).to.be.true;
					expect(user.canIUse('api-write')).to.be.false;
					expect(admin.canIUse('api-read')).to.be.true;
					expect(admin.canIUse('api-write')).to.be.true;
					expect(user.getDisplayName()).to.equal('user1234');
					expect(admin.getDisplayName()).to.equal('user1234 (ADMIN)');
				});
			});
		});
	});

	describe('Configuration: autoinit', function () {
		var BaseType = Trope(function BaseType () {
			this.baseState = 'setup';
		});
		var EventEmitter = Trope({
			privacy: true,
			autoinit: true,
			inherits: BaseType,
			type: 'EventEmitter',
		}, function EventEmitter () {
			this.eventMap = {};
			this.super();
		}, {
			on: function (name, handler) {
				if (this.eventMap[name] === undefined) {
					this.eventMap[name] = [];
				}
				this.eventMap[name].push(handler);
			},
			emit: function (name) {
				var i;
				var args;
				if (this.eventMap[name]) {
					args = [];
					for (i=1; i<arguments.length; i++) {
						args.push(arguments[i]);
					}
					for (i=0; i<this.eventMap[name].length; i++) {
						this.eventMap[name][i].apply(this.exports, args);
					}
				}
			}
		});

		it('should automatically initialize an object according to the Trope it was configured for when creating an object which inherits from it', function () {
			var EventedType = EventEmitter.chain({
				go: function (val) {
					this.emit('go', val);
				}
			});
			var eventedInstance = EventedType.create();
			var testStack = [];
			eventedInstance.on('go', function (val) {
				testStack.push(val);
			});
			eventedInstance.go(3);
			eventedInstance.go(2);
			eventedInstance.go(1);
			expect(testStack).to.deep.equal([3,2,1]);
			expect(eventedInstance).to.be.an.instanceOf(EventedType);
			expect(eventedInstance).to.be.an.instanceOf(EventEmitter);
			expect(eventedInstance).to.be.an.instanceOf(BaseType);
			expect(eventedInstance).to.have.property('baseState', 'setup');
		});

		it('should take the arguments passed into the main constructor by default', function () {
			var EventedType = Trope(EventEmitter, {
				__TROPEDEF__: true,
				autoinit: true,
				constructor: function (eventMap) {
					this.eventMap = eventMap;
					this.super();
				}
			}).chain({
				go: function (val) {
					this.emit('go', val);
				}
			});
			var eventMap = {};
			var eventedInstance = EventedType.create(eventMap);
			var testStack = [];
			eventedInstance.on('go', function (val) {
				testStack.push(val);
			});
			eventedInstance.go(6);
			eventedInstance.go(5);
			eventedInstance.go(4);
			expect(testStack).to.deep.equal([6,5,4]);
			expect(eventMap).to.have.property('go');
			expect(eventedInstance).to.be.an.instanceOf(EventedType);
			expect(eventedInstance).to.be.an.instanceOf(BaseType);
			expect(eventedInstance).to.have.property('baseState', 'setup');
		});

		it('should take no arguments if set to a special new function just for initializing instead of just setting it to true', function () {
			var EventedType = Trope(EventEmitter, {
				__TROPEDEF__: true,
				autoinit: function () {
					this.eventMap = {};
					this.super();
				},
				constructor: function (eventMap) {
					this.eventMap = eventMap;
				}
			}).chain({
				go: function (val) {
					this.emit('go', val);
				}
			});

			var eventedInstance = EventedType.create();
			var testStack = [];
			eventedInstance.on('go', function (val) {
				testStack.push(val);
			});
			eventedInstance.go(6);
			eventedInstance.go(5);
			eventedInstance.go(4);
			expect(testStack).to.deep.equal([6,5,4]);
			expect(eventedInstance).to.be.an.instanceOf(EventedType);
			expect(eventedInstance).to.be.an.instanceOf(BaseType);
			expect(eventedInstance).to.have.property('baseState', 'setup');
		});

		it('should take no arguments if set to an array of default arguments', function () {
			var EventedType = Trope(EventEmitter, {
				__TROPEDEF__: true,
				autoinit: [{}],
				constructor: function (eventMap) {
					this.eventMap = eventMap;
					this.super();
				}
			}).chain({
				go: function (val) {
					this.emit('go', val);
				}
			});

			var eventedInstance = EventedType.create();
			var testStack = [];
			eventedInstance.on('go', function (val) {
				testStack.push(val);
			});
			eventedInstance.go(6);
			eventedInstance.go(5);
			eventedInstance.go(4);
			expect(testStack).to.deep.equal([6,5,4]);
			expect(eventedInstance).to.be.an.instanceOf(EventedType);
			expect(eventedInstance).to.be.an.instanceOf(BaseType);
			expect(eventedInstance).to.have.property('baseState', 'setup');
		});
	});

	describe('Configuration: selfish', function () {
		var EventEmitter;
		describe('basic', function () {
			it('should bind the target context to the first arg of every method/constructor', function () {
				EventEmitter = Trope.define({
					autoinit: true,
					selfish: true,
					constructor: function EventEmitter (self, ctx) {
						self.eventMap = {};
						self.context = ctx || null;
					},
					private: {
						initializeEventName: function (self, eventName) {
							self.eventMap[eventName] = {
								on: [],
								once: []
							};
						},
						getEventInfo: function (self, eventName) {
							if (!self.eventMap[eventName]) {
								self.initializeEventName(eventName);
							}
							return self.eventMap[eventName];
						},
						findHandler: function (self, handler) {
							var eventName;
							var i;
							for (eventName in self.eventMap) {
								if (self.eventMap.hasOwnProperty(eventName)) {
									for (i=0; i<self.eventMap[eventName].on.length; i++) {
										if (self.eventMap[eventName].on[i] === handler) {
											return {
												eventName: eventName,
												key: 'on',
												index: i,
												array: self.eventMap[eventName].on
											};
										}
									}
									for (i=0; i<self.eventMap[eventName].once.length; i++) {
										if (self.eventMap[eventName].once[i] === handler) {
											return {
												eventName: eventName,
												key: 'once',
												index: i,
												array: self.eventMap[eventName].once
											};
										}
									}
								}
							}
							return false;
						}
					},
					prototype: {
						on: function (self, eventName, handler) {
							self.getEventInfo(eventName).on.push(handler);
							return handler;
						},
						once: function (self, eventName, handler) {
							self.getEventInfo(eventName).once.push(handler);
							return handler;
						},
						emit: function (self, eventName) {
							var args = arguments;
							var eventData = [];
							var i;
							for (i=2; i<args.length; i++) {
								eventData.push(args[i]);
							}
							self.getEventInfo(eventName).on.forEach(function (handler) {
								if (handler) {
									handler.apply(self.context, eventData);
								}
							});
							self.getEventInfo(eventName).once.forEach(function (handler) {
								if (handler) {
									handler.apply(self.context, eventData);
								}
							});
							self.getEventInfo(eventName).once = [];
						},
						remove: function (self, handler) {
							var handlerResult = self.findHandler(handler);
							if (handlerResult) {
								handlerResult.array[handlerResult.index] = null;
								return handler;
							}
							return false;
						},
						clear: function (self, eventName) {
							self.initializeEventName(eventName);
						}
					}
				});

				var stack = [];
				var appended;

				var ee = EventEmitter.create();
				var handler = ee.on('append', function (data) {
					stack.push(data);
				});
				ee.once('append', function (data) {
					appended = data;
				});
				ee.emit('append', 4);
				ee.emit('append', 2);
				ee.remove(handler);
				ee.emit('append', 6);
				ee.emit('append', 7);
				ee.once('append', function (data) {
					appended = data;
				});
				ee.clear('append');
				ee.emit('append', 3);
				ee.emit('append', 1);

				expect(stack).to.deep.equal([4, 2]);
				expect(appended).to.equal(4);

				expect(ee).to.have.property('on');
				expect(ee).to.have.property('once');
				expect(ee).to.have.property('emit');
				expect(ee).to.have.property('remove');
				expect(ee).to.have.property('clear');
				expect(ee).to.not.have.property('initializeEventName');
				expect(ee).to.not.have.property('getEventInfo');
				expect(ee).to.not.have.property('findHandler');
				expect(ee).to.not.have.property('eventMap');
				expect(ee).to.not.have.property('context');
			});
		});
		describe('with inheritance', function () {
			it('should be able to inherit from a Trope defined with selfish without being selfish', function () {
				// this test depends on the previous test to run first
				var Stream = EventEmitter.turn({
					write: function (data) {
						this.emit('write', data);
					},
					read: function (onWrite) {
						this.onWrite = this.on('write', onWrite);
					},
					end: function () {
						if (this.onWrite) {
							this.remove(this.onWrite);
						}
					}
				});
				var stream = Stream.create();
				var buffer = [];
				stream.read(function (data) {
					buffer.push(data);
				});
				stream.write('no');
				stream.write('one');
				stream.write('expects');
				stream.write('the');
				stream.write('spanish');
				stream.write('inquisition');
				stream.end();
				stream.write('foo');
				stream.write('bar');
				expect(buffer).to.deep.equal(['no','one','expects','the','spanish','inquisition']);
				expect(stream).to.be.an.instanceOf(Stream);
				expect(stream).to.be.an.instanceOf(EventEmitter);
				expect(Stream.trope).to.have.property('isSelfish', false);
				expect(EventEmitter.trope).to.have.property('isSelfish', true);
			});
		});
	});

	describe('Scenarios', function () {
		describe('simple', function () {});
		describe('complex', function () {
			describe('EventEmitter', function () {
				it('should work', function () {
					var EventEmitter = Trope.define({
						autoinit: true,
						constructor: function EventEmitter (ctx) {
							this.eventMap = {};
							this.context = ctx || null;
						},
						private: {
							initializeEventName: function (eventName) {
								this.eventMap[eventName] = {
									on: [],
									once: []
								};
							},
							getEventInfo: function (eventName) {
								if (!this.eventMap[eventName]) {
									this.initializeEventName(eventName);
								}
								return this.eventMap[eventName];
							},
							findHandler: function (handler) {
								var self = this;
								var eventName;
								var i;
								for (eventName in self.eventMap) {
									if (self.eventMap.hasOwnProperty(eventName)) {
										for (i=0; i<self.eventMap[eventName].on.length; i++) {
											if (self.eventMap[eventName].on[i] === handler) {
												return {
													eventName: eventName,
													key: 'on',
													index: i,
													array: self.eventMap[eventName].on
												};
											}
										}
										for (i=0; i<self.eventMap[eventName].once.length; i++) {
											if (self.eventMap[eventName].once[i] === handler) {
												return {
													eventName: eventName,
													key: 'once',
													index: i,
													array: self.eventMap[eventName].once
												};
											}
										}
									}
								}
								return false;
							}
						},
						prototype: {
							on: function (eventName, handler) {
								this.getEventInfo(eventName).on.push(handler);
								return handler;
							},
							once: function (eventName, handler) {
								this.getEventInfo(eventName).once.push(handler);
								return handler;
							},
							emit: function (eventName) {
								var self = this;
								var args = arguments;
								var eventData = [];
								var i;
								for (i=1; i<args.length; i++) {
									eventData.push(args[i]);
								}
								this.getEventInfo(eventName).on.forEach(function (handler) {
									if (handler) {
										handler.apply(self.context, eventData);
									}
								});
								this.getEventInfo(eventName).once.forEach(function (handler) {
									if (handler) {
										handler.apply(self.context, eventData);
									}
								});
								this.getEventInfo(eventName).once = [];
							},
							remove: function (handler) {
								var handlerResult = this.findHandler(handler);
								if (handlerResult) {
									handlerResult.array[handlerResult.index] = null;
									return handler;
								}
								return false;
							},
							clear: function (eventName) {
								this.initializeEventName(eventName);
							}
						}
					});

					var stack = [];
					var appended;

					var ee = EventEmitter.create();
					var handler = ee.on('append', function (data) {
						stack.push(data);
					});
					ee.once('append', function (data) {
						appended = data;
					});
					ee.emit('append', 4);
					ee.emit('append', 2);
					ee.remove(handler);
					ee.emit('append', 6);
					ee.emit('append', 7);
					ee.once('append', function (data) {
						appended = data;
					});
					ee.clear('append');
					ee.emit('append', 3);
					ee.emit('append', 1);

					expect(stack).to.deep.equal([4, 2]);
					expect(appended).to.equal(4);

					expect(ee).to.have.property('on');
					expect(ee).to.have.property('once');
					expect(ee).to.have.property('emit');
					expect(ee).to.have.property('remove');
					expect(ee).to.have.property('clear');
					expect(ee).to.not.have.property('initializeEventName');
					expect(ee).to.not.have.property('getEventInfo');
					expect(ee).to.not.have.property('findHandler');
					expect(ee).to.not.have.property('eventMap');
					expect(ee).to.not.have.property('context');
				});
			});
		});
		describe('weird', function () {});
		describe('insane', function () {});
		describe('README example', function () {
			it('should work', function () {
				//#### Inheritance Chain

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
				expect(pumbaa.getLongName()).to.equal('Animalia');

				// Chaining prototypes
				var Mammal = Animal.turn({
					// constructor: function () {},
					getLongName: function () {
						return this.super() + ' Mammalia';
					}
				});

				pumbaa = Mammal.create(); // or `new Mammal()`
				pumbaa.name = 'Pumbaa';
				pumbaa.getLongName(); // 'Animalia Mammalia'
				expect(pumbaa.getLongName()).to.equal('Animalia Mammalia');

				// Constructor functions

				var Carnivore = Mammal.turn({
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
				expect(pumbaa.getLongName()).to.equal('Animalia Mammalia Carnivora');

				// Super functions

				var Canine = Carnivore.turn({
					constructor: function (name) {
						this.super(name.toUpperCase());
					},
					getLongName: function () {
						return this.super() + ' Canis';
					}
				});

				pumbaa = Canine.create('Pumbaa'); // or `new Canine('Pumbaa')`
				pumbaa.name === 'PUMBAA'; // true
				expect(pumbaa.name).to.equal('PUMBAA');
				pumbaa.getLongName(); // 'Animalia Mammalia Carnivora Canis'
				expect(pumbaa.getLongName()).to.equal('Animalia Mammalia Carnivora Canis');

				// Private members

				var Dog = Canine.turn({ privacy: true }, {
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
				expect(pumbaa.name).to.equal('PUMBAA');
				pumbaa.getLongName(); // 'Animalia Mammalia Carnivora Canis familiaris'
				expect(pumbaa.getLongName()).to.equal('Animalia Mammalia Carnivora Canis familiaris');
				pumbaa.secret; // undefined
				expect(pumbaa.secret).to.be.undefined;
				pumbaa.shareSecret(); // 'shhhh...'
				expect(pumbaa.shareSecret()).to.be.equal('shhhh...');

				// Protected members for inheriting Tropes

				var Weiner = Dog.turn({ privacy: true }, {
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
				expect(pumbaa.name).to.equal('pumbaa');
				pumbaa.getLongName(); // 'Animalia Mammalia Carnivora Canis familiaris (Dachshund)'
				expect(pumbaa.getLongName()).to.equal('Animalia Mammalia Carnivora Canis familiaris (Dachshund)');
				pumbaa.secret; // undefined
				expect(pumbaa.secret).to.be.undefined;
				pumbaa.shareSecret(); // 'shhhh...w00f!'
				expect(pumbaa.shareSecret()).to.be.equal('shhhh...w00f!');

				//#### Multiple Inheritance Chain

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
					.turn(Logger)
					.turn(Dog)
					.turn({
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
				expect(pumbaa.getLongName()).to.equal('Animalia Mammalia Carnivora Canis familiaris');
				pumbaa.bark(); // 'PUMBAA: Bark!'
				pumbaa.woof(); // 'PUMBAA: Woof!'
							// 'PUMBAA: shhhh...!'
				pumbaa.secret; // undefined
				expect(pumbaa.secret).to.be.undefined;
				pumbaa.ruff(); // 'PUMBAA: Ruff!'

				Trope.instanceOf(pumbaa, Logger); // true
				expect(Trope.instanceOf(pumbaa, Logger)).to.be.true;
				Trope.instanceOf(pumbaa, EventEmitter); // true
				expect(Trope.instanceOf(pumbaa, EventEmitter)).to.be.true;
				Trope.instanceOf(pumbaa, Dog); // true
				expect(Trope.instanceOf(pumbaa, Dog)).to.be.true;
				// debugger;
				Trope.instanceOf(pumbaa, Mammal); // true
				expect(Trope.instanceOf(pumbaa, Mammal)).to.be.true;
				Trope.instanceOf(pumbaa, Animal); // true
				expect(Trope.instanceOf(pumbaa, Animal)).to.be.true;
			});
		});
		describe('Better Examples', function () {
			describe('Object factories (basic)', function () {
				it('should work (basic-factories)', function () {
					// [EXAMPLE]
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

					// [CHECK]
					expect(greeter).to.be.an.instanceOf(Greeter);
					expect(greeter).to.have.property('name', 'Bertrand');
					expect(greeter.sayHello()).to.equal('Hello, Bertrand!');
				});
			});

			describe('Object factories (initializers)', function () {
				it('should work (basic-initializers)', function () {
					// [EXAMPLE]
					// If you want to initialize state when you create an object, you can pass in an initializer function
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

					// you can alternatively create new objects by calling the Trope directly as a function or constructor
					greeter = Greeter('Bertrand');
					greeter = new Greeter('Bertrand');

					// [CHECK]
					expect(greeter).to.be.an.instanceOf(Greeter);
					expect(greeter).to.have.property('name', 'Bertrand');
					expect(greeter.sayHello()).to.equal('Hello, Bertrand!');
				});
			});

			describe('Private properties (basic)', function () {
				it('should work (privacy-basic)', function () {
					// [EXAMPLE]
					// You could define a Trope in `privacy` mode to prevent other code from accessing/modifying object properties
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

					// [CHECK]
					expect(greeter).to.be.an.instanceOf(Greeter);
					expect(greeter).to.not.have.property('name');
					expect(greeter.sayHello()).to.equal('Hello, Bertrand!');
				});
			});

			describe('Private properties (exports)', function () {
				it('should work (privacy-exports)', function () {
					// [EXAMPLE]
					// In `privacy` mode, you can still expose public properties using `exports`
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

					// [CHECK]
					expect(greeter).to.be.an.instanceOf(Greeter);
					expect(greeter).to.not.have.property('name');
					expect(greeter).to.have.property('exposedName', 'Bertrand');
					expect(greeter.sayHello()).to.equal('Hello, Bertrand!');
				});
			});

			describe('Inheritance (basic)', function () {
				it('should work (inheritance-basic)', function () {
					// [EXAMPLE]
					// create simple or complex inheritance chains
					var Animal = Trope({
						getLongName: function () {
							return 'Animalia';
						}
					});

					// when inheriting you can overload a function and call the parent with `this.super()`
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

					// all true since Trope inheritance is based on JavaScript's native prototypal inheritance mechanisms
					mammal instanceof Mammal;
					mammal instanceof Vertebrate;
					mammal instanceof Animal;

					// [CHECK]
					expect(mammal).to.be.instanceOf(Mammal);
					expect(mammal).to.be.instanceOf(Vertebrate);
					expect(mammal).to.be.instanceOf(Animal);
					expect(mammal.getLongName()).to.equal('Animalia Chordata Mammalia');
				});
			});

			describe('Inheritance (multiple)', function () {
				// Setup for shared data
				// used when one example sets up another
				var shared = {};
				var Logger;
				var EventEmitter;
				var Cat;
				afterEach(function () {
					Logger = shared.Logger;
					EventEmitter = shared.EventEmitter;
					Cat = shared.Cat;
				});

				// Stub for console.log
				var console_log;
				var logBuffer;
				before(function () {
					console_log = console.log;
					console.log = function (msg) {
						logBuffer.push(msg);
					};
				});
				beforeEach(function () {
					logBuffer = [];
				});
				after(function () {
					console.log = console_log;
				});

				it('should work (inheritance-multiple-setup)', function () {
					// [EXAMPLE]
					// Define a Logger
					var Logger = Trope({
						log: function (msg) {
							console.log(msg);
						}
					});

					// Define an EventEmitter
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

					// [CHECK]
					expect(Logger.create()).to.be.an.instanceOf(Logger);
					expect(Logger.create()).to.not.be.an.instanceOf(EventEmitter);
					expect(EventEmitter.create()).to.not.be.an.instanceOf(Logger);
					expect(EventEmitter.create()).to.be.an.instanceOf(EventEmitter);

					// [SHARE]
					shared.Logger = Logger;
					shared.EventEmitter = EventEmitter;
				});

				it('should work (inheritance-multiple-basic)', function () {
					// [EXAMPLE]
					var EventedLogger = Trope([Logger, EventEmitter]);

					var eventedLogger = EventedLogger.create();
					eventedLogger.on('logme', function (msg) {
						eventedLogger.log('LOGME: ' + msg);
					});
					eventedLogger.fire('logme', 'hello'); // logs 'LOGME: hello'
					eventedLogger.fire('logme', 'world'); // logs 'LOGME: world'

					// [CHECK]
					expect(eventedLogger).to.be.an.instanceOf(EventedLogger);
					expect(Trope.instanceOf(eventedLogger, EventEmitter)).to.be.true;
					expect(Trope.instanceOf(eventedLogger, Logger)).to.be.true;
					expect(logBuffer).to.deep.equal(['LOGME: hello', 'LOGME: world']);
				});

				it('should work (inheritance-multiple-extended-cat)', function () {
					// [EXAMPLE]
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

					// [CHECK]
					expect(cat).to.be.an.instanceOf(Cat);
					expect(cat.vocalize()).to.equal('Meow!');

					// [SHARE]
					shared.Cat = Cat;
				});

				it('should work (inheritance-multiple-extended)', function () {
					// [EXAMPLE]
					// Use `Logger`, `EventEmitter`, and `Cat` to define something completely different
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

					// [CHECK]
					expect(logBuffer).to.deep.equal(['Raja: Meow!', 'Raja: Purr...']);
				});
			});

			describe('Backward compatibility with native JavaScript constructors', function () {
				// Setup for shared data
				// used when one example sets up another
				var shared = {};
				var Shape;
				afterEach(function () {
					Shape = shared.Shape;
				});

				it('should work (native-setup)', function () {
					// [EXAMPLE]
					// Native JS constructor Shape
					function Shape (sides) {
						this.sides = sides;
					}
					Shape.prototype.getSides = function () {
						return this.sides;
					};

					// Create a Trope out of Shape and immediately create a Shape object
					var triangle = new Shape(3);
					triangle instanceof Shape; // true
					triangle.getSides(); // 3

					// [CHECK]
					expect(triangle).to.be.an.instanceOf(Shape);
					expect(triangle.getSides()).to.equal(3);
					expect(triangle).to.have.property('sides', 3);

					// [SHARE]
					shared.Shape = Shape;
				});

				it('should work (native-basic)', function () {
					// [EXAMPLE]
					// Create a Trope out of Shape and immediately create a Shape object
					var triangle = Trope(Shape).create(3);
					triangle instanceof Shape; // true

					// [CHECK]
					expect(triangle).to.be.an.instanceOf(Shape);
					expect(triangle).to.have.property('sides', 3);
					expect(triangle.getSides()).to.equal(3);
				});

				it('should work (native-extend)', function () {
					// [EXAMPLE]
					// Any Trope, even one based on a Native JS constructor, can be extended
					var Quadrilateral = Trope(Shape).turn(function (opts) {
						this.sides = 4;
					});

					var quadrilateral = Quadrilateral.create();
					quadrilateral instanceof Quadrilateral;
					quadrilateral instanceof Shape;
					quadrilateral.getSides(); // 4

					// [CHECK]
					expect(quadrilateral).to.be.an.instanceOf(Quadrilateral);
					expect(quadrilateral).to.be.an.instanceOf(Shape);
					expect(quadrilateral).to.have.property('sides', 4);
					expect(quadrilateral.getSides()).to.equal(4);
				});
			});

			describe('Selfish Definitions', function () {
				it('should work (selfish-definitions-interpret)', function () {
					// [EXAMPLE]
					// Native JS constructor Shape
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
					expect(greeter).to.be.an.instanceOf(Greeter); // [CHECK]
					greeter.sayHello(); // "Hello, Bertrand!"
					expect(greeter.sayHello()).to.equal('Hello, Bertrand!'); // [CHECK]
					greeter.setName('Russell');
					greeter.sayHello(); // "Hello, Russell!"
					expect(greeter.sayHello()).to.equal('Hello, Russell!'); // [CHECK]
				});

				it('should work (selfish-definitions-define)', function () {
					// [EXAMPLE]
					// Native JS constructor Shape
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
					expect(greeter).to.be.an.instanceOf(Greeter); // [CHECK]
					greeter.sayHello(); // "Hello, Bertrand!"
					expect(greeter.sayHello()).to.equal('Hello, Bertrand!'); // [CHECK]
					greeter.setName('Russell');
					greeter.sayHello(); // "Hello, Russell!"
					expect(greeter.sayHello()).to.equal('Hello, Russell!'); // [CHECK]
				});
			});
		});
	});
});
