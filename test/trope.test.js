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

describe('Trope', function () {

	describe('Trope Constructor', function () {
		it('should create a raw Trope object');
	});

	describe('#define', function () {

		it('should create a Trope constructor');

		it('should create a null Trope constructor for a null/undefined definition');

		describe('wrapping native js constructor', function () {
			it('should create a Trope constructor for the given js constructor function');
		});

		describe('simple trope definition', function () {
			it('should create a Trope constructor for the given trope definition');
			it('should create a Trope constructor for the given prototype object without a constructor function');
		});
	});

	describe('#Define', function () {

		it('should create a Trope constructor');

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
