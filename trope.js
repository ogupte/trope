((function (namespace, moduleDefinition) {
	'use strict';
	var MODULE;
	var EXPORTS;
	if (typeof module !== 'undefined' && module.exports) { // define for CommonJS
		MODULE = module;
		EXPORTS = module.exports;
	} else {
		MODULE = {
			'exports': {}
		};
		EXPORTS = MODULE.exports;
	}
	var moduleDefinitionReturns = moduleDefinition(MODULE, EXPORTS);
	if (moduleDefinitionReturns) {
		MODULE.exports = moduleDefinitionReturns;
	}
	if (typeof window !== 'undefined') { // define for browser
		window[namespace] = MODULE.exports;
	}
	return moduleDefinitionReturns;
})('Trope', function (module, exports) {
//START trope.js
'use strict';

/*
 #     #
 #     # ##### # #       ####
 #     #   #   # #      #
 #     #   #   # #       ####
 #     #   #   # #           #
 #     #   #   # #      #    #
  #####    #   # ######  ####

*/

/**
	@function mix
	@param {object} srcObj - source object providing new properties
	@param {object} destObj - destination object receiving new properties
	@returns {object} the destination object which has received the new properties
	@desc mixes properties from a source object to a destination object
*/
function mix (srcObj, destObj) {
	if (srcObj === destObj) {
		return destObj;
	}
	var keys = Object.keys(srcObj);
	var i;
	var key;
	for (i=0; i<keys.length; i+=1) {
		key = keys[i];
		destObj[key] = srcObj[key];
	}
	return destObj;
}

function forEachPrototypeOf (obj, callback) {
	var proto = Object.getPrototypeOf(obj);
	if (obj) {
		if (proto) {
			callback(proto);
			forEachPrototypeOf(proto, callback);
		}
	}
}

/* iterates over the full prototype chain (including the given object) starting with the last item in the chain (usually Object.prototype) */
function forEachProtoInChain (obj, callback) {
	var prototypeChain = [obj];
	var i;
	forEachPrototypeOf(obj, function (proto) {
		prototypeChain.push(proto);
	});
	for (i=prototypeChain.length-1; i>=0; i--) {
		callback(prototypeChain[i]);
	}
}

function forEachMethod (obj, callback) {
	Object.keys(obj).forEach(function (memberName) {
		if (typeof obj[memberName] === 'function') {
			callback(obj[memberName], memberName);
		}
	});
}

function setNonEnumerableProperty (obj, name, value) {
	return Object.defineProperty(obj, name, {
		value: value,
		configurable: true,
		enumerable: false,
		writable: true
	});
}

function applyAliases(object, aliases, target) {
	var i;
	for (i=0; i<aliases.length; i++) {
		object[aliases[i]] = target;
	}
}

function appendCapitalized(aliases) {
	var originalLength = aliases.length;
	var i;
	var alias;
	for (i=0; i<originalLength; i++) {
		alias = aliases[i];
		aliases.push(alias.charAt(0).toUpperCase() + alias.substr(1));
	}
	return aliases;
}

/*
 #######
    #    #####   ####  #####  ######
    #    #    # #    # #    # #
    #    #    # #    # #    # #####
    #    #####  #    # #####  #
    #    #   #  #    # #      #
    #    #    #  ####  #      ######

*/
var Trope = (function () {
	function tropeDefaultDefinition () {
		return module.exports.defaultDefinition.apply(module.exports, arguments);
	}
	function tropeDefaultAction () {
		return module.exports.defaultAction.apply(module.exports, arguments);
	}
	module.exports = tropeDefaultAction;

	function set (key, value) {
		module.exports[key] = value;
	}
	set('set', set);

	var OBJECT = 'object';
	var FUNCTION = 'function';
	var STRING = 'string';
	var PROTOTYPE = 'prototype';
	var CONSTRUCTOR = 'constructor';
	var NOOP = function () {};
	var NULLFUNC = function Null () {};
	var AUTOINIT_CONSTRUCTOR = 0x4d414943;
	var AUTOINIT_INIT_FUNC = 0x4d414949;
	var AUTOINIT_ARGS = 0x4d414941;
	var DEFINE_ALIAS = appendCapitalized([
		'class',
		'extend',
		'define'
	]);
	var INTERPRET_ALIAS = appendCapitalized([
		'proto',
		'turn',
		'link',
		'chain'
	]);

	function ensureIsATrope (trope) {
		if (!(trope instanceof Trope)) {
			if (typeof trope === FUNCTION) {
				if (trope.trope) {
					trope = trope.trope;
				} else {
					trope = new Trope({
						constructor: trope,
						prototype: trope.prototype,
						useSuper: false
					});
				}
			} else {
				trope = new Trope({
					prototype: trope,
					useSuper: false
				});
			}
		}
		return trope;
	}

	function ExecutionStack (self) {
		self.stack = [];
		return self;
	}
	ExecutionStack.prototype = {
		push: function (executionContext, type, data) {
			this.stack.push({executionContext: executionContext, type: type, data: data});
		},
		pop: function () {
			return this.stack.pop();
		},
		peek: function () {
			return this.stack[this.stack.length-1];
		}
	};
	ExecutionStack.create = function () {
		return ExecutionStack(Object.create(ExecutionStack.prototype));
	};

	var EXEC_OVERRIDE_METHOD = 0x3200;
	var EXEC_CONSTRUCTOR = 0x3000;
	var EXEC_METHOD = 0x3300;
	var EXEC_PRIVATE_METHOD = 0x3400;
	/**
	ExecutionContext controls most of the run-time logic.
	*/
	function ExecutionContext (self, trope, pubCtx, privateCtx, executionStack) {
		self.trope = ensureIsATrope(trope);
		self.pubCtx = pubCtx || Object.create(self.trope.finalProto);
		self.privateCtx = privateCtx || Object.create(self.pubCtx);
		if (!self.privateCtx.exports) {
			self.privateCtx.exports = self.pubCtx;
		}
		self.targetCtx = self.getTargetContext();
		self.executionStack = executionStack || ExecutionStack.create();
		return self;
	}
	ExecutionContext.create = function (trope, pubCtx, privateCtx, executionStack) {
		return ExecutionContext(Object.create(ExecutionContext.prototype), trope, pubCtx, privateCtx, executionStack);
	};
	ExecutionContext.prototype = {
		as: function (trope) {
			return ExecutionContext.create(trope, this.pubCtx, this.privateCtx, this.executionStack);
		},
		hasSuper: function () {
			if (this.trope.superConstr) {
				return true;
			}
			return false;
		},
		overrideMethod: function (name, method, asTrope) {
			var self = this;
			var originalMethod;
			if (self.pubCtx.hasOwnProperty && self.pubCtx.hasOwnProperty(name)) {
				originalMethod = self.pubCtx[name];
			}

			self.pubCtx[name] = function () {
				var args = arguments;
				var executionContext = self;
				if (asTrope) {
					executionContext = self.as(asTrope);
				}
				self.executionStack.push(executionContext, EXEC_OVERRIDE_METHOD, {name: name, superMethod: originalMethod});
				var returnValue = method.apply(executionContext.getTargetContext(), args);
				self.executionStack.pop();
				return returnValue;
			};
		},
		getPublicContext: function () {
			return this.pubCtx;
		},
		getPrivateContext: function () {
			return this.privateCtx;
		},
		getTargetContext: function () {
			var ctx;
			if (this.trope.isPrivate) {
				ctx = this.privateCtx;
			} else {
				ctx = this.pubCtx;
			}
			return ctx;
		},
		callWithContext: function (executionMode, func, targetCtx, data) {
			this.executionStack.push(this, executionMode, data);
			var returnValue = func(targetCtx);
			this.executionStack.pop();
			return returnValue;
		},
		getAsMemberFunction: function (name, func, isPrivate, syncMode) {
			var self = this;
			var targetCtx = self.targetCtx;
			var execMode = EXEC_METHOD;
			if (isPrivate === false) {
				targetCtx = self.pubCtx;
			} else if (isPrivate === true) {
				targetCtx = self.privateCtx;
				if (syncMode) {
					execMode = EXEC_PRIVATE_METHOD;
				}
			}
			return function () {
				var args = arguments;
				var returnValue;
				var _func = func;
				self.callWithContext(execMode, function (ctx) {
					if (self.trope.isSelfish) { // if the defining trope is is 'selfish' mode
						_func = func.bind(ctx, targetCtx); // pass in the target context as the first argument to the method
					}
					returnValue = _func.apply(ctx, args);
				}, targetCtx, {name: name});
				return returnValue;
			};
		},
		getAsPublicMethod: function (name, func) {
			return this.getAsMemberFunction(name, func, false, true);
		},
		getAsPrivateMethod: function (name, func) {
			return this.getAsMemberFunction(name, func, true, true);
		},
		getMethod: function (name) {
			var method = this.trope.methodMap[name];
			return this.as(method.trope).getAsMemberFunction(name, method.func);
		},
		getPrivateMethod: function (name) {
			var method = this.trope.privateMethodMap[name];
			return this.as(method.trope).getAsPrivateMethod(name, method.func);
		},
		callAsConstructor: function (func) {
			return this.callWithContext(EXEC_CONSTRUCTOR, func, this.targetCtx);
		},
		getParentContextualFunction: function () {
			if (this.trope.inherits) {
				return this.as(this.trope.inherits).getContextualFunction();
			} else {
				return undefined;
			}
		},
		getSuperFunction: function () {
			return this.executionStack.peek().executionContext.getParentContextualFunction();
		},
		getContextualFunction: function () {
			var current = this.executionStack.peek();
			var execCtx;
			var execType;
			var execData;
			if (current) {
				execCtx = current.executionContext;
				execType = current.type;
				execData = current.data;
			} else {
				return undefined;
			}

			if (execType === EXEC_CONSTRUCTOR) {
				return this.getConstructor();
			} else if (execType === EXEC_OVERRIDE_METHOD) {
				return execData.superMethod;
			} else if (execType === EXEC_METHOD) {
				return this.getMethod(execData.name);
			} else if (execType === EXEC_PRIVATE_METHOD) {
				return this.getPrivateMethod(execData.name);
			} else {
				return undefined;
			}
		},
		getConstructor: function (surrogateConstructor) {
			var self = this;
			var constr = surrogateConstructor || self.trope.constr;
			return function () {
				var args = arguments;
				self.callAsConstructor(function (ctx) {
					if (self.trope.isSelfish) { // if the defining trope is is 'selfish' mode
						constr.bind(ctx, self.getTargetContext()).apply(ctx, args); // pass in the target context as the first argument to the constructor, then apply
					} else {
						constr.apply(ctx, args);// otherwise just apply the supplied arguments
					}
				});
			};
		}
	};

	/**
	Trope constructor controls all of the definition-time logic.
	*/
	function Trope (def) {
		if (typeof def === FUNCTION) {
			if (def.trope && def.trope instanceof Trope) {
				return def.trope;
			} else {
				def = {
					constructor: def
				};
			}
		}

		def = def || {
			prototype: Object.create(null),
			useSuper: false
		};

		var trope = this;

		trope.def = def;

		trope.proto = (function () {
			if (def.prototype) {
				return def.prototype;
			} else if (def.public) {
				return def.public;
			} else if (def.prototype === null) {
				return Object.create(null);
			} else if (Object.hasOwnProperty.call(def.constructor, PROTOTYPE)) {
				return def.constructor.prototype;
			} else {
				return Object.create(null);
			}
		}());

		trope.constr = (function () {
			if (def.hasOwnProperty(CONSTRUCTOR)) {
				if (def.constructor.trope) {
					return def.constructor.trope.constr;
				} else {
					return def.constructor;
				}
			} else if (def.__init__) {
				return def.__init__;
			} else if (def.init) {
				return def.init;
			} else if (trope.proto.hasOwnProperty && trope.proto.hasOwnProperty(CONSTRUCTOR)) {
				return trope.proto.constructor;
			} else if (trope.proto instanceof Object) {
				return NOOP;
			} else {
				return NULLFUNC;
			}
		}());

		//extends is an alias for inherits
		if (def.extends && !def.inherits) {
			def.inherits = def.extends;
		}
		// trope.inherits always a Trope object or null
		trope.inherits = (function () {
			var i;
			var inheritHead;
			if (def.inherits) {
				if (Array.isArray(def.inherits) && def.inherits.length) {
					inheritHead = ensureIsATrope(def.inherits[0]);
					for (i=1; i<def.inherits.length; i++) {
						inheritHead = inheritHead.createChildTrope(ensureIsATrope(def.inherits[i]).getDefinition());
					}
					return inheritHead;
				} else {
					return ensureIsATrope(def.inherits);
				}
			} else {
				return null;
			}
		}());

		trope.typeName = (function () {
			var functionName;
			if (def.type) {
				return def.type;
			} else if (trope.constr !== Object && trope.constr.name) {
				return trope.constr.name;
			} else if ((function () {
				// this handles getting the constructor name in IE
				var functionSource = trope.constr.toString();
				functionName = functionSource.substr(0, functionSource.indexOf('(')).replace('function', '').trim();
				return functionName;
			}())) {
				return functionName;
			} else if (trope.inherits) {
				return trope.inherits.typeName + '\u2093';
			} else {
				return 'Object\u2093';
			}
		}());
		trope.instanceName = def.instance || trope.typeName + '\u1d62';
		if (def.useInstanceName === undefined || def.useInstanceName) {
			trope.instanceContructor = eval('(function ' + trope.instanceName + ' () {})');
			trope.instanceContructor.trope = trope;
		}

		trope.useSuper = (function () {
			if (trope.inherits && trope.inherits.useSuper) {
				if (def.useSuper !== undefined && !def.useSuper) {
					// throw new Error ('useSuper must be same as parent!');
					console.warn('useSuper {'+trope.typeName+'} must be same as parent {'+trope.inherits.typeName+'} (defaults to true)!');
				}
				return trope.inherits.useSuper; // if super uses super, this one has to as well
			}
			if (def.useSuper !== undefined) {
				return def.useSuper; // user user-defined setting
			}
			return true; // defaults to true
		}());

		trope.isSelfish = !!def.selfish; // ensure isSelfish is a boolean

		trope.isPrivate = (function () {
			if (def.private) {
				return true;
			}
			if (def.privacy !== undefined) {
				return def.privacy; //use-defined takes top priority
			}
			if (trope.inherits) {
				return trope.inherits.isPrivate; //if it inherits, default to parent value
			}
			return false; //defaults to false
		}());

		trope.methodMap = (function () {
			var methodMap = {};
			trope.forEachTropeInChain(function (currentTrope) {
				currentTrope.forEachMethod(function (method, methodName) {
					methodMap[methodName] = {
						trope: currentTrope,
						func: method
					};
				});
			});
			return methodMap;
		}());

		trope.privateMethodMap = (function () {
			var methodMap = null;
			if (trope.inherits && trope.inherits.privateMethodMap){
				methodMap = {};
				Object.keys(trope.inherits.privateMethodMap).forEach(function (methodName) {
					var methodData = trope.inherits.privateMethodMap[methodName];
					methodMap[methodName] = methodData;
				});
			}
			if (trope.def.private && methodMap === null) {
				methodMap = {};
			}
			if (trope.def.private) {
				forEachMethod(trope.def.private, function (method, methodName) {
					methodMap[methodName] = {
						name: methodName,
						func: method,
						trope: trope
					};
				});
			}
			return methodMap;
		}());

		trope.autoInitializeConfigs = [];
		trope.forEachTropeInChain(function (currentTrope) {
			var autoinitDef = currentTrope.def.autoinit;
			if (autoinitDef && currentTrope !== trope) {
				if (Array.isArray(autoinitDef)) {
					trope.autoInitializeConfigs.push({ mode: AUTOINIT_ARGS, trope: currentTrope, args: autoinitDef });
				} else if (typeof autoinitDef === FUNCTION) {
					trope.autoInitializeConfigs.push({ mode: AUTOINIT_INIT_FUNC, trope: currentTrope, initFunc: autoinitDef });
				} else {
					trope.autoInitializeConfigs.push({ mode: AUTOINIT_CONSTRUCTOR, trope: currentTrope });
				}
			}
		});

		// TODO make this look better
		trope.finalProto = trope.getPrototype();
		if (trope.constr !== Object) {
			setNonEnumerableProperty(trope.finalProto, CONSTRUCTOR, trope.constr); // display type is correct (cosmetic) -> final prototype points to the original constructor
		}
	}

	Trope.prototype = {
		getConstructor: function () {
			var trope = this;
			return (function (constr) {
				constr.trope = trope;
				constr.create = function create () {
					return constr.apply(null, arguments);
				};
				applyAliases(constr, INTERPRET_ALIAS, trope.interpretChild.bind(trope));
				applyAliases(constr, DEFINE_ALIAS, trope.defineChild.bind(trope));
				return constr;
			}(trope.buildProxyConstructor()));
		},
		buildProxyConstructor: function () {
			var trope = this;
			// return a proxy constructor function
			return (function (proxyConstructor){
				proxyConstructor.prototype = trope.finalProto; // set the prototype of the proxy constructor to the actual prototype object
				return proxyConstructor; // return a proxy constructor function
			}(function () {
				var args = arguments;
				var executionContext = ExecutionContext.create(trope);
				var pubCtx = executionContext.getPublicContext();
				var privateCtx = executionContext.getPrivateContext();
				if (trope.useSuper) {
					if (pubCtx.hasOwnProperty && !pubCtx.hasOwnProperty('super')) {
						Object.defineProperty(pubCtx, 'super', {
							enumerable: false,
							get: function () {
								var superFunction;
								if (trope.inherits) {
									superFunction = executionContext.getSuperFunction();
								}
								if (superFunction) {
									superFunction.as = function (_trope) {
										return executionContext.as(_trope).getContextualFunction();
									};
								}
								return superFunction;
							}
						});
					}
				}

				Object.keys(trope.methodMap).forEach(function (methodName) {
					var methodData = trope.methodMap[methodName];
					setNonEnumerableProperty(pubCtx, methodName, executionContext.as(methodData.trope).getAsMemberFunction(methodName, methodData.func));
				});
				if (trope.privateMethodMap) {
					Object.keys(trope.privateMethodMap).forEach(function (privateMethodName) {
						var privateMethodData = trope.privateMethodMap[privateMethodName];
						setNonEnumerableProperty(privateCtx, privateMethodName, executionContext.as(privateMethodData.trope).getAsPrivateMethod(privateMethodName, privateMethodData.func));
					});
				}

				if (trope.instanceContructor) {
					setNonEnumerableProperty(pubCtx, CONSTRUCTOR, trope.instanceContructor);
				}
				trope.autoInitializeConfigs.forEach(function (autoinitConfig) {
					var autoinitTrope = autoinitConfig.trope;
					if (autoinitConfig.mode === AUTOINIT_CONSTRUCTOR) {
						executionContext.as(autoinitTrope).getConstructor().apply(null, args);
					} else if (autoinitConfig.mode === AUTOINIT_ARGS) {
						executionContext.as(autoinitTrope).getConstructor().apply(null, autoinitConfig.args);
					} else if (autoinitConfig.mode === AUTOINIT_INIT_FUNC) {
						executionContext.as(autoinitTrope).getConstructor(autoinitConfig.initFunc).apply(null, args);
					}
				});
				// generate an appropriate constructor from the execution context and apply with the supplied arguments
				executionContext.getConstructor().apply(executionContext.getTargetContext(), args);
				return pubCtx;
			}));
		},
		getPrototype: function () {
			var trope = this;
			if (trope.inherits) {
				return mix(trope.proto, Object.create(trope.inherits.finalProto));
			} else {
				return trope.proto;
			}
		},
		getSuperConstructor: function () {
			var trope = this;
			if (trope.useSuper && trope.inherits) {
				return trope.inherits.getConstructor(true);
			} else {
				return null;
			}
		},
		forEachTropeInChain: function (callback) {
			var trope = this;
			if (trope.inherits) {
				trope.inherits.forEachTropeInChain(callback); // can possibly max out call stack in circular dependencies
			}
			callback(trope);
		},
		forEachMethod: function (callback) {
			var trope = this;
			forEachProtoInChain(trope.proto, function (proto) {
				forEachMethod(proto, callback);
			});
		},
		createChildTrope: function (def) {
			var trope = this;
			def = def || {};
			if (!def.inherits) {
				def.inherits = trope;
				return new Trope(def);
			} else {
				var definitionSuperTrope = (function (inherits) {
					if (inherits) {
						if (inherits instanceof Trope) {
							return inherits;
						} else if (inherits.trope) {
							return inherits.trope;
						} else {
							if (typeof inherits === FUNCTION) {
								return new Trope({
									constructor: inherits,
									prototype: inherits.prototype,
									useSuper: false
								});
							} else {
								return new Trope({
									prototype: inherits,
									useSuper: false
								});
							}
						}
					} else {
						return null;
					}
				}(def.inherits));
				var topTrope = trope;
				definitionSuperTrope.forEachTropeInChain(function (currentTrope) {
					topTrope = new Trope(currentTrope.getDefinition({ inherits: topTrope }));
				});
				def.inherits = topTrope;
				return new Trope(def);
			}
		},
		defineChild: function (def) {
			var trope = this;
			var childTrope = trope.createChildTrope(def);
			return childTrope.getConstructor();
		},
		interpretChild: function () {
			var trope = this;
			var args = arguments;
			var def = tropeDefaultDefinition.apply(null, args);
			return trope.defineChild(def);
		},
		getDefinition: function (override) {
			var trope = this;
			if (override) {
				return mix(override, mix(trope.def, {}));
			}
			return mix(trope.def, {});
		},
		isInstance: function (obj) {
			var trope = this;
			var shareConstructor = false;
			forEachPrototypeOf(obj, function (proto) {
				if (proto.constructor === trope.constr) {
					shareConstructor = true;
				}
			});
			return shareConstructor;
		}
	};
	set('Trope',Trope);

	function define (def) {
		var trope = new Trope(def);
		return trope.getConstructor();
	}
	set('define', define);

	function instanceOf (arg0, arg1) {
		if (arguments.length !== 2) {
			throw new Error('Trope.instanceOf only supports 2 arguments');
		}
		var constr, obj;
		if (typeof arg0 === FUNCTION && typeof arg1 === OBJECT) {
			constr = arg0;
			obj = arg1;
		} else if (typeof arg0 === OBJECT && typeof arg1 === FUNCTION) {
			obj = arg0;
			constr = arg1;
		} else {
			throw new Error('Trope.instanceOf must have an OBJECT and FUNCTION as arguments');
		}
		if (constr.trope) {
			return constr.trope.isInstance(obj);
		} else {
			return obj instanceof constr;
		}
	}
	set('instanceOf', instanceOf);

	function interpretDefinition () {
		var args = arguments;
		var i;
		var stack = [];
		var def = {};
		for (i=0; i<args.length; i++) {
			stack.push(args[i]);
		}
		var arg = stack.pop();
		var isProtoDefined = false;
		while (arg) {
			if (typeof arg === FUNCTION) {
				if (arg.trope) {
					def = arg.trope.getDefinition(def);
				} else {
					def.constructor = arg;
				}
			} else if (typeof arg === OBJECT) {
				if (Array.isArray(arg)) {
					if (def.inherits) {
						if (Array.isArray(def.inherits)) {
							// def.inherits.splice(0, 0, arg);
							def.inherits = def.inherits.concat(arg);
						} else {
							def.inherits = [def.inherits].concat(arg);
						}
					} else {
						def.inherits = arg;
					}
				} else if (isProtoDefined || arg.__TROPEDEF__) {
					def = mix(def, arg);
				} else {
					def.prototype = arg;
					isProtoDefined = true;
				}
			} else if (typeof arg === STRING) {
				def.type = arg;
			}
			arg = stack.pop();
		}
		return def;
	}
	set('defaultDefinition', interpretDefinition);

	function interpret () {
		var def;
		var args = arguments;
		var arg0;
		if (args.length === 1) {
			arg0 = args[0];
			if (typeof arg0 === FUNCTION && arg0.trope) {
				return arg0;
			} else if (arg0 === null) {
				return define(null);
			}
		}
		def = interpretDefinition.apply(null, args);
		return define(def);
	}
	set('interpret', interpret);
	set('defaultAction', interpret);

	applyAliases(module.exports, INTERPRET_ALIAS, interpret);
	applyAliases(module.exports, DEFINE_ALIAS, define);
}());
//END trope.js
}));
