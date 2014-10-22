'use strict';
/* jslint unused:false */
/* jslint undef:false */
/* globals describe,it,before,beforeEach,after,afterEach,xdescribe,xit */
/* jslint expr:true */
if (typeof require === 'undefined') {
	var expect = chai.expect;
	var tropeClass = window.exports;
} else {
	var expect = require('chai').expect;
	var Trope = require('../trope.js');
}

xdescribe('Trope Instance', function () {});

describe('Trope Usage', function () {

	describe('Creation', function () {
		describe('Trope constructor', function () {
			it('should create a Trope instance');
			it('should return a constructor function with trope.getConstructor()');
		});
		describe('Trope.define', function () {
			it('should return a Trope constructor function');
		});
		describe('Trope.Define', function () {
			it('should return a Trope constructor function');
			describe('0 arguments: ()', function () {
				it('should return a Trope constructor for an object with no prototype');
			});
			describe('1 argument: (X)', function () {
				describe('(prototype object)', function () {
					it('should return a Trope constructor which uses the given prototype');
				});
				describe('(Trope definition)', function () {
					it('should return a Trope constructor which uses the given Trope definition');
				});
				describe('(Trope constructor)', function () {
					it('should return a Trope constructor which extends the given Trope');
				});
				describe('(native constructor)', function () {
					it('should return a Trope constructor which uses the given constructor function');
				});
				describe('(type string)', function () {
					it('should return a Trope constructor which uses the given type string');
				});
			});
			describe('2 arguments: (X,Y)', function () {
				describe('(Trope definition, prototype object)', function () {
					it('should return a Trope constructor based on the given definition which uses the given prototype');
				});
				describe('(Trope definition, Trope constructor)', function () {
					it('should return a Trope constructor based on the given Trope\'s definition where the given definition can modify');
				});
				describe('(Trope definition, native constructor)', function () {
					it('should return a Trope constructor based on the given definition which uses the given constructor function');
				});
				describe('(Trope definition, type string)', function () {
					it('should return a Trope constructor based on the given definition which uses the given type string');
				});
				describe('(Trope constructor, prototype object)', function () {
					it('should return a Trope constructor based on the given Trope\'s definition which uses the given prototype');
				});
				describe('(Trope constructor, type string)', function () {
					it('should return a Trope constructor based on the given Trope\'s definition which uses the given type string');
				});
				describe('(native constructor, prototype object)', function () {
					it('should return a Trope constructor which uses the given constructor and prototype');
				});
				describe('(native constructor, type string)', function () {
					it('should return a Trope constructor which uses the given constructor and type string');
				});
				describe('(type string, prototype object)', function () {
					it('should return a Trope constructor which uses the given type string and prototype');
				});
				describe('(type string, Trope constructor)', function () {
					it('should return a Trope constructor based on the given Trope\'s definition which uses the given type string');
				});
				describe('(type string, native constructor)', function () {
					it('should return a Trope constructor which uses the given type string and constructor function');
				});
				describe('(null, prototype object)', function () {
					it('should return a Trope constructor which uses the given prototype');
				});
				describe('(null, Trope constructor)', function () {
					it('should return a Trope constructor which extends the given Trope');
				});
				describe('(null, native constructor)', function () {
					it('should return a Trope constructor which uses the given constructor function');
				});
				describe('(null, type string)', function () {
					it('should return a Trope constructor which uses the given type string');
				});
			});
			describe('3 arguments: (X,Y,Z)', function () {
				describe('(Trope definition, Trope constructor, type string)', function () {
					it('should return a Trope constructor based on the given Trope\'s definition where the given definition can modify using the given type string');
				});
				describe('(Trope definition, native constructor, prototype object)', function () {
					it('should return a Trope constructor based on the given definition which uses the given constructor function and prototype');
				});
				describe('(Trope definition, native constructor, type string)', function () {
					it('should return a Trope constructor based on the given definition which uses the given constructor function and type string');
				});
				describe('(Trope definition, prototype object, native constructor)', function () {
					it('should return a Trope constructor based on the given definition which uses the given constructor function and prototype');
				});
				describe('(Trope definition, prototype object, type string)', function () {
					it('should return a Trope constructor based on the given definition which uses the given prototype and type string');
				});
				describe('(Trope definition, type string, Trope constructor)', function () {
					it('should return a Trope constructor based on the given Trope\'s definition where the given definition can modify using the given type string');
				});
				describe('(Trope definition, type string, native constructor)', function () {
					it('should return a Trope constructor based on the given definition which uses the given constructor function and type string');
				});
				describe('(Trope definition, type string, prototype object)', function () {
					it('should return a Trope constructor based on the given definition which uses the given prototype and type string');
				});
				describe('(type string, native constructor, prototype object)', function () {
					it('should return a Trope constructor which uses the given type string, constructor function, and prototype');
				});
				// other combinations are possible but would be silly to use
			});
			describe('more arguments: (X,Y,Z,…)', function () {
				it('should only recognize the first three arguments');
			});
		});
		describe('chained from another Trope (trope.extend)', function () {
			it('should return a Trope constructor which inherits from the chained Trope object');
		});
	});

	describe('Compatability', function () {
		describe('using native constructor functions', function () {
			it('should create a Trope defined with a native constructor function');
		});
		describe('using only prototype objects', function () {
			it('should create a Trope defined with a prototype object');
		});
		describe('using Trope constructors', function () {
			it('should create a Trope defined with another Trope constructor');
		});
		describe('using Trope objects', function () {
			it('should create a Trope defined with another Trope instance');
		});
	});

	describe('Inheritance', function () {
		describe('shallow', function () {
			it('should support shallow (<3) inheritance chains');
		});
		describe('deep', function () {
			it('should support deep (3+) inhertance chains');
		});
		describe('multiple', function () {
			it('should support multiple inheritance by proxying parents into the current inheritance chain');
		});
	});

	describe('Configuration: useSuper', function () {
		describe('default config value', function () {
			it('should default to false when no definition is passed in');
			it('should default to true when not specified in the given definition');
		});
		describe('useSuper: true', function () {
			describe('simple', function () {
				it('should create a Trope which has a super accessor in the constructor');
				it('should create a Trope which has a super accessor in any overwritten methods');
			});
			describe('with inheritance', function () {
				describe('homogeneous (all parents have useSuper set to true in their definitions) & mixed (parents have both true and false values for useSuper in their defintions)', function () {
					it('should make super available to all constructors in the inheritance chain');
					it('should make super available to all overwritten methods in the inheritance chain');
				});
			});
		});
		describe('useSuper: false', function () {
			describe('simple', function () {
				it('should create a Trope which does not use a super accessor in the constructor');
				it('should create a Trope which does not use a super accessor in any overwritten methods');
			});
			describe('with inheritance', function () {
				describe('homogeneous', function () {
					it('should create a Trope which does not use a super accessor in any of the constructors in the inheritance chain');
					it('should create a Trope which does not use a super accessor in any overwritten methods');
				});
				describe('mixed (parents have both true and false values for useSuper in their defintions)', function () {
					it('should make super available to all constructors in the inheritance chain');
					it('should make super available to all overwritten methods in the inheritance chain');
				});
			});
		});
	});

	describe('Configuration: privacy', function () {
		describe('default config value', function () {
			it('should default to false when not specified in the given definition and it doesn\'t inherit');
			it('should default to whatever value is in the definition the Trope inherits from');
		});
		describe('privacy: true', function () {
			describe('simple', function () {
				it('should create a Trope in which the constructor and methods access the private context with `this`');
				it('should create a Trope in which the constructor and methods access the public context with `this.exports`');
			});
			describe('with inheritance', function () {
				describe('homogeneous (all parents have privacy set to true in their definitions) & mixed (parents have both true and false values for privacy in their defintions)', function () {
					it('should create a Trope in which all constructors and methods access the private context with `this`');
					it('should create a Trope in which all constructors and methods access the public context with `this.exports`');
				});
			});
		});
		describe('privacy: false', function () {
			describe('simple', function () {
				it('should create a Trope in which the constructor and methods access the public context with `this`');
			});
			describe('with inheritance', function () {
				describe('homogeneous', function () {
					it('should create a Trope in which all constructors and methods access the public context with `this`');
				});
				describe('mixed (parents have both true and false values for privacy in their defintions)', function () {
					it('should create a Trope in which those constructors and methods whose definitions have privacy set to true are able to access the private context with `this` and public context with `this.exports`');
					it('should create a Trope in which those constructors and methods whose definitions have privacy set to false are not able to access the private context and can access the public context with `this`');
				});
			});
		});
	});

	describe('Scenarios', function () {
		describe('simple', function () {});
		describe('complex', function () {});
		describe('weird', function () {});
		describe('insane', function () {});
	});
});

xdescribe('trope', function () {

	var Person = (function () {
		function Person (name) {
			this.setName(name);
			this.age = null;
		}
		Person.prototype.setName = function (name) {
			this.name = name;
		};
		Person.prototype.setAge = function (age) {
			this.age = age;
		};
		return Person;
	}());

	var Employee;
	var Engineer;

	xit ('should return a constructor', function () {
		Employee = Trope.define({
			// useSuper: true,
			privacy: true,
			constructor: function Employee (name) {
				this.name = name;
				this.age = null;
				this.salary = null;
			},
			prototype: {
				setName: function (name) {
					this.name = name;
				},
				setAge: function (age) {
					this.age = age;
				},
				setSalary: function (salary) {
					this.salary = salary;
				},
				printCard: function () {
					var self = this;
					console.log('Employee-----');
					console.log(JSON.stringify({
						name: self.name,
						age: self.age,
						salary: self.salary
					}));
					console.log('-------------');
				}
			}
		});
		console.log(Employee);
		var employee = new Employee('Oliver Gupte');
		employee.setAge(26);
		employee.setSalary(54321);
		employee.printCard();
		// expect(employee).to.not.have.property('name');
		// expect(employee).to.not.have.property('age');
		// expect(employee).to.not.have.property('salary');
		// expect(employee).to.have.property('foo');
		// expect(Employee).to.be.a.function;
		console.log('Employee Object: %O',employee);
	});

	xit ('should wrap a native constructor', function () {
		var _Person = Trope.define({constructor: Person});
		console.log(_Person);
		var person = new _Person('Oviler');
		person.setAge(22);
		console.log(person);
	});

	xit ('should extend a native constructor and use super', function () {
		Employee = Trope.define({
			inherits: Person,
			// useSuper: false,
			privacy: true,
			constructor: function Employee (name) {
				this.super(name);
				this.salary = null;
			},
			prototype: {
				setSalary: function (salary) {
					this.salary = salary;
				},
				printCard: function () {
					var self = this;
					console.log('Employee-----');
					console.log(JSON.stringify({
						name: self.name,
						age: self.age,
						salary: self.salary
					}));
					console.log('-------------');
				}
			}
		});

		var employee = new Employee('Oliver Gupte');
		employee.setAge(26);
		employee.setSalary(54321);
		employee.printCard();
		// expect(employee).to.not.have.property('name');
		// expect(employee).to.not.have.property('age');
		// expect(employee).to.not.have.property('salary');
		// expect(employee).to.have.property('foo');
		console.log('Employee Object: %O',employee);
	});

	xit ('should extend a trope which extends a constructor and uses more super', function () {
		Employee = Trope.define({
			inherits: Person,
			// useSuper: false,
			privacy: true,
			constructor: function Employee (name) {
				this.super(name);
				// this.super(Employee, name);
				this.salary = null;
				this.exports.privateCtx = this;
			},
			prototype: {
				setSalary: function (salary) {
					this.salary = salary;
				},
				printCard: function () {
					var self = this;
					console.log('Employee-----');
					console.log(JSON.stringify({
						name: self.name,
						age: self.age,
						salary: self.salary
					}));
					console.log('-------------');
				}
			}
		});

		Engineer = Trope.define({
			inherits: Employee,
			// useSuper: true,
			// useInstanceName: false,
			// privacy: true,
			constructor: function Engineer (name, email) {
				this.super(name);
				// this.super(Engineer, name);
				this.email = email;
				this.setSalary(123456);
			},
			prototype: {
				code: function () {
					this.isCoding = true;
					console.log('['+this.name+' is coding...]');
				},
				printCard: function () {
					var self = this;
					console.log('Engineeer=======');
					console.log('  email: ' + self.email);
					this.super();
				}
			}
		});

		var engineer = new Engineer('Oliver Gupte', 'ogupte@appnexus.com');
		engineer.setAge(26);
		engineer.code();
		engineer.printCard();
		console.log('Engineer Object: %O',engineer);
		expect(engineer).to.be.an.instanceOf(Engineer);
		expect(engineer).to.be.an.instanceOf(Employee);
		expect(engineer).to.be.an.instanceOf(Person);
		expect(engineer).to.be.an.instanceOf(Object);

	});

	xit ('should not break', function () {
		// Person = Trope.define({
		// 	constructor: Person,
		// 	privacy: true,
		// 	useSuper: false
		// });
		Employee = Trope.define({
			inherits: Person,
			// useSuper: false,
			privacy: true,
			constructor: function Employee (name) {
				this.super(name);
				// this.name = name;
				this.salary = null;
				// this.exports.privateCtx = this;
			},
			prototype: {
				setSalary: function (salary) {
					this.salary = salary;
				},
				printCard: function () {
					var self = this; //refers to the public context, which is a problem for accessing private members
					console.log('Employee-----');
					console.log(JSON.stringify({
						name: self.name,
						age: self.age,
						salary: self.salary
					}));
					console.log('-------------');
				}
			}
		});

		Engineer = Trope.define({
			inherits: Employee,
			// useSuper: false,
			// useInstanceName: false,
			privacy: true,
			constructor: function Engineer (name, email) {
				this.super(name);
				// this.name = name;
				this.email = email;
				this.setSalary(123456);
			},
			prototype: {
				code: function () {
					this.isCoding = true;
					console.log('['+this.name+' is coding...]');
				},
				printCard: function () {
					var self = this;
					console.log('Engineeer=======');
					console.log('  email: ' + self.email);
					this.super();
					// console.log('Employee-----');
					// console.log(JSON.stringify({
					// 	name: self.name,
					// 	age: self.age,
					// 	salary: self.salary
					// }));
					// console.log('-------------');
				}
			}
		});

		var engineer = new Engineer('Oliver Gupte', 'ogupte@appnexus.com');
		// var engineer = Engineer.create('Oliver G', 'oagupte@gmail.com');
		engineer.setAge(26);
		engineer.code();
		engineer.printCard();
		console.log('Engineer Object: %O',engineer);
		expect(engineer).to.be.an.instanceOf(Engineer);
		expect(engineer).to.be.an.instanceOf(Employee);
		expect(engineer).to.be.an.instanceOf(Person);
		expect(engineer).to.be.an.instanceOf(Object);

		//Object.getPrototypeOf(engineer);
		engineer.hackTest = function () {
			console.log(this.email);
		};
		engineer.hackTest();

	});

	it('should do cool things', function () {
		// var Blank = Trope.Chain(function Logger() {
		// 	this.buffer = [];
		// }, {
		// 	log: function (msg) {
		// 		this.buffer.push(msg);
		// 	}
		// });

		// var Blank = Trope.Proto(function foo (){});

		// var Blank = Trope.turn(function Logger() {
		// 	this.buffer = [];
		// }, {
		// 	log: function (msg) {
		// 		this.buffer.push(msg);
		// 	}
		// }).turn({privacy: true}, function XLogger() {
		// 	this.thisIsPrivate = true;
		// }, {
		// 	moreShit: function () {}
		// }).turn({
		// 	constructor: function TEST() {},
		// 	test: function () {
		// 		console.log('test');
		// 	}
		// });

		// var Blank = Trope.proto().chain('LOGGER', function () {
		// 	this.foo = 'bar';
		// }, {
		// 	log: function (msg) {
		// 		console.log(msg);
		// 	}
		// });
		//
		// // var Blank = Trope.define();
		// var blank = Blank.create();
		// console.log('%O',blank);

		var EventEmitter = Trope.draft({
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

		var Logger = Trope.draft({
			privacy: true
		}, function Logger (prefix) {
			this.prefix = prefix;
		}, {
			log: function (msg) {
				console.log(this.prefix + ': ' + msg);
			}
		});

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

		var PersonLogger = Logger.proto({privacy: false}, Person).proto(function (name, age) {
			this.super.as(Logger)(name);
			this.super(name, age);
		});
		var personLogger = new PersonLogger('oliver', 99);
		personLogger.log('hello');
		console.log(personLogger);

		var Employee = Trope.proto(EventEmitter).proto(Logger).proto({privacy: false}, Person).proto({
			constructor: function Employeee (name, age, salary) {
				this.super.as(EventEmitter)();
				this.super.as(Logger)(name);
				this.super(name, age);
				this.salary = salary;
			},
			getBusinessCard: function () {
				console.log('|--Employee---------------');
				console.log('|    name: ' + this.name);
				console.log('|    age: ' + this.age);
				console.log('|    salary: ' + this.salary);
				console.log('|-------------------------');
			}
		});

		var oliverEmployee = Employee.create('Oliver Gupte', 26, 123456);
		oliverEmployee.on('promote', function (arg0) {
			this.log('WOOHOO I GOT PROMOTED!! ' + arg0);
		});
		oliverEmployee.getBusinessCard();
		oliverEmployee.emit('promote', 654321);
		console.log('%O', oliverEmployee);

	});

});
