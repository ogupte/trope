((function (namespace, moduleDefinition) {
	'use strict';
	var MODULE;
	var EXPORTS;
	var isBrowser = false;
	if (typeof window !== 'undefined') { // define for browser
		isBrowser = true;
		MODULE = {
			'exports': {}
		};
		EXPORTS = MODULE.exports;
	} else if (typeof module !== 'undefined' && module.exports) { // define for CommonJS
		MODULE = module;
		EXPORTS = module.exports;
	}
	var moduleDefinitionReturns = moduleDefinition(MODULE, EXPORTS);
	if (moduleDefinitionReturns) {
		MODULE.exports = moduleDefinitionReturns;
	}
	if (isBrowser) {
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
	var keys = Object.keys(srcObj),
		i, key;
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
	var globalCtx = this;
	var exports = Define;
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
	var DEFINE_ALIAS = (function (aliases) {
		var originalLength = aliases.length;
		var i;
		var alias;
		for (i=0; i<originalLength; i++) {
			alias = aliases[i];
			aliases.push(alias.charAt(0).toUpperCase() + alias.substr(1));
		}
		return aliases;
	} ([
		'class',
		'proto',
		'alter',
		'alt',
		'turn',
		'extend',
		'ext',
		'modify',
		'mod',
		'link',
		'chain',
		'draft',
		'denote',
		'outline',
		'cast',
		'exhibit',
		'model',
		'compound',
		'enhance'
	]));

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
			}
			//TODO if trope is not a func
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

	var EXEC_METHOD = 0x3200;
	var EXEC_SUPER = 0x3100;
	var EXEC_CONSTRUCTOR = 0x3000;
	function ExecutionContext (self, trope, pubCtx, privateCtx, targetCtx, executionStack) {
		self.trope = ensureIsATrope(trope);
		self.pubCtx = pubCtx;
		self.privateCtx = privateCtx;
		self.targetCtx = targetCtx;
		self.executionStack = executionStack || ExecutionStack.create();
		return self;
	}
	ExecutionContext.create = function (trope, pubCtx, privateCtx, targetCtx, executionStack) {
		return ExecutionContext(Object.create(ExecutionContext.prototype), trope, pubCtx, privateCtx, targetCtx, executionStack);
	};
	ExecutionContext.prototype = {
		as: function (trope) {
			return ExecutionContext.create(trope, this.pubCtx, this.privateCtx, this.targetCtx, this.executionStack);
		},
		hasSuper: function () {
			if (this.trope.superConstr) {
				return true;
			}
			return false;
		},
		addMethod: function (name, method, trope) {
			var self = this;
			var superMethod;
			var superTrope;
			if (self.pubCtx.hasOwnProperty && self.pubCtx.hasOwnProperty(name)) {
				superMethod = self.pubCtx[name];
				superTrope = superMethod.trope;
			}

			self.pubCtx[name] = function () {
				var args = arguments;
				var ctx;
				var returnValue;
				if (trope.isPrivate) {
					ctx = self.privateCtx;
				} else {
					ctx = self.pubCtx;
				}
				self.executionStack.push(self.as(trope), EXEC_METHOD, {methodName: name, superMethod: superMethod, superTrope: superTrope});
				returnValue = method.apply(ctx, args);
				self.executionStack.pop();
				// var returnValue = self.callAsMethod(name, function (ctx) {
				// 	return method.apply(ctx, args);
				// });
				return returnValue;
			};
			self.pubCtx[name].trope = trope;
		},
		getPublicContext: function () {
			return this.pubCtx;
		},
		callAsMethod: function (name, func) {
			var ctx;
			var returnValue;
			if (this.trope.isPrivate) {
				ctx = this.privateCtx;
			} else {
				ctx = this.pubCtx;
			}
			this.executionStack.push(this, EXEC_METHOD);
			returnValue = func(ctx);
			this.executionStack.pop();
			return returnValue;
		},
		// callAsSuper: function (func) {
		// 	var ctx;
		// 	if (this.trope.isPrivate) {
		// 		ctx = this.privateCtx;
		// 	} else {
		// 		ctx = this.pubCtx;
		// 	}
		// 	this.executionStack.push(this, EXEC_SUPER);
		// 	func(ctx);
		// 	this.executionStack.pop();
		// },
		callAsConstructor: function (func) {
			var ctx;
			if (this.trope.isPrivate) {
				ctx = this.privateCtx;
			} else {
				ctx = this.pubCtx;
			}
			this.executionStack.push(this, EXEC_CONSTRUCTOR);
			func(ctx);
			this.executionStack.pop();
		},
		_getSuperFunction: function () {
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
			if (execCtx.trope.inherits) {
				if (execType === EXEC_CONSTRUCTOR) {
					return this.as(execCtx.trope.inherits).getConstructor();
				} else if (execType === EXEC_METHOD) {
					return execData.superMethod;
					// return this.as(execCtx.trope.inherits).getMethod(current.methodName);
					// return this.as(execData.superTrope).getMethod(execData.methodName);
					// throw new Error('THIS SHOULD NOT HAPPEN');
				}
			} else {
				return undefined;
			}
			// var self = this;
			// var args = arguments;
			// var newArgs = [args].concat(args);
			// return function () {
			// 	self.callAsSuper(function (ctx) {
			// 		self.trope.superConstr.apply(ctx, newArgs);
			// 	});
			// };
		},
		getSuperFunction: function () {
			if (this.trope.inherits) {
				return this.as(this.trope.inherits).getXFunction();
			} else {
				return undefined;
			}
		},
		getXFunction: function () {
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
			} else if (execType === EXEC_METHOD) {
				return execData.superMethod;
			}
		},
		// getMethod: function (name) {
		// 	var self = this;
		// 	var _method = this.trope
		// 	return function () {
		// 		var args = arguments;
		// 		var newArgs = [self];
		// 		var i;
		// 		for (i=0; i<args.length; i++) {
		// 			newArgs.push(args[i]);
		// 		}
		// 		this.executionStack.push(this, EXEC_METHOD);
		// 		_method.apply(null, newArgs);
		// 		this.executionStack.pop();
		// 	};
		// },
		_getConstructor: function () {
			var self = this;
			var _constr = self.trope.createProxyConstructor(true);
			return function () {
				var args = arguments;
				var newArgs = [self];
				var i;
				for (i=0; i<args.length; i++) {
					newArgs.push(args[i]);
				}
				self.executionStack.push(self, EXEC_CONSTRUCTOR);
				_constr.apply(null, newArgs);
				self.executionStack.pop();
			};
			// return this.trope.createProxyConstructor(true);
		},
		getConstructor: function () {
			var self = this;
			return function () {
				var args = arguments;
				self.callAsConstructor(function (ctx) {
					self.trope.constr.apply(ctx, args);
				});
			};
		}
	};

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
				return def.constructor;
			} else if (trope.proto.hasOwnProperty && trope.proto.hasOwnProperty(CONSTRUCTOR)) {
				return trope.proto.constructor;
			} else if (trope.proto instanceof Object) {
				return NOOP;
			} else {
				return NULLFUNC;
			}
		}());

		// trope.inherits is always a Trope object or null
		trope.inherits = (function () {
			if (def.inherits) {
				if (def.inherits instanceof Trope) {
					return def.inherits;
				} else if (def.inherits.trope) {
					return def.inherits.trope;
				} else {
					if (typeof def.inherits === FUNCTION) {
						return new Trope({
							constructor: def.inherits,
							prototype: def.inherits.prototype,
							useSuper: false
						});
					} else {
						return new Trope({
							prototype: def.inherits,
							useSuper: false
						});
					}
				}
			} else {
				return null;
			}
		}());

		trope.typeName = (function () {
			if (def.type) {
				return def.type;
			} else if (trope.constr !== Object && trope.constr.name) {
				return trope.constr.name;
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
		trope.isPrivate = (function () {
			if (def.privacy !== undefined) {
				return def.privacy; //use-defined takes top priority
			}
			if (trope.inherits) {
				return trope.inherits.isPrivate; //if it inherits, default to parent value
			}
			return false; //defaults to false
		}());

		trope.superConstr = trope.getSuperConstructor();

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
		getConstructor: function (isSuper) {
			var trope = this;
			return (function (constr) {
				constr.prototype = trope.finalProto;
				constr.trope = trope;
				constr.create = function create () {
					var instance = Object.create(constr.prototype);
					constr.apply(instance, arguments);
					return instance;
				};
				applyAliases(constr, DEFINE_ALIAS, trope.extend.bind(trope));
				return constr;
			}(trope.createProxyConstructor(isSuper)));
		},
		createProxyConstructor: function (isSuper) {
			var trope = this;

			// return a proxy constructor function
			return function (executionContext) {
				var args = arguments;
				// var memoArgs = arguments;
				var pubCtx = this;
				var privateCtx;
				var targetCtx = pubCtx;
				if (pubCtx === globalCtx) {
					// was not called with the `new` operator
					pubCtx = Object.create(trope.finalProto);
					// targetCtx = pubCtx;
				}
				privateCtx = Object.create(pubCtx);
				privateCtx.exports = pubCtx;
				// function getPrivateCtx () {
				// 	// if (isSuper) {
				// 	// 	return memoArgs[1];
				// 	// }
				// 	if (!privateCtx) {
				// 		privateCtx = Object.create(pubCtx);
				// 		privateCtx.exports = pubCtx;
				// 	}
				// 	return privateCtx;
				// }
				// if (trope.isPrivate) {
				// 	targetCtx = getPrivateCtx();
				// }
				// var superStack;

				if (!isSuper) {
					executionContext = ExecutionContext.create(trope, pubCtx, privateCtx, targetCtx);
				} else {
					executionContext = args[0].as(trope);
					var newArgs = [];
					for (var i=1; i<args.length; i++) {
						newArgs.push(args[i]);
					}
					args = newArgs;
				}
				if (trope.useSuper && !isSuper) {
					if (pubCtx.hasOwnProperty && !pubCtx.hasOwnProperty('super')) {
						Object.defineProperty(pubCtx, 'super', {
							enumerable: false,
							get: function () {
								var superFunction = function () {
									new Error('No Super Function Found.');
								};
								// if (executionContext.hasSuper()) {
								if (trope.inherits) {
									// superFunction = executionContext.as(trope.inherits).getSuperFunction();
									superFunction = executionContext.executionStack.peek().executionContext.getSuperFunction();
									// superFunction = executionContext.as(trope.inherits).getConstructor();
								}
								if (superFunction) {
									superFunction.as = function (_trope) {
										return executionContext.as(_trope).getXFunction();
										// return executionContext.as(_trope).getConstructor();
									};
								}
								return superFunction;
							}
						});
						/*Object.defineProperty(pubCtx, 'super', {
							enumerable: false,
							get: function () {
								var topOfStack = superStack.peek();
								var targetCtx = pubCtx;
								if (!topOfStack) {
									return undefined;
								} else {
									if (!topOfStack.func) {
										return undefined;
									}
									if (topOfStack.trope && topOfStack.trope.isPrivate) {
										targetCtx = getPrivateCtx();
									}
									if (topOfStack.isConstructor) {
										var superConstr = function () {
											var args = arguments;
											var i;
											var newArgs = [superStack, getPrivateCtx()];
											for (i=0; i<args.length; i++) {
												newArgs.push(args[i]);
											}
											topOfStack.func.apply(targetCtx, newArgs);
										};

										superConstr.as = function (_trope) {
											if (!(_trope instanceof Trope)) {
												if (typeof _trope === FUNCTION) {
													if (_trope.trope) {
														_trope = _trope.trope;
													} else {
														// _trope = getAsTrope(_trope);
														_trope = new Trope({
															constructor: _trope,
															prototype: _trope.prototype,
															useSuper: false
														});
													}
												}
											}
											var _superConstr = _trope.createProxyConstructor(true);
											return function () {
												var i;
												var args = [superStack, getPrivateCtx()];
												for (i=0; i<arguments.length; i++) {
													args.push(arguments[i]);
												}
												_superConstr.apply(pubCtx, args);
											};
										};
										return superConstr;
									} else {
										var superFunc = function () {
											var returnValue;
											if (topOfStack.trope.inherits) {
												superStack.push({ func: topOfStack.trope.inherits.finalProto[topOfStack.methodName], trope: topOfStack.trope.inherits, isMethod: true, methodName: topOfStack.methodName });
											} else {
												superStack.push({ func: null, trope: null, isMethod: true, methodName: topOfStack.methodName });
											}
											returnValue = topOfStack.func.apply(targetCtx, arguments);
											superStack.pop();
											return returnValue;
										};
										var superFuncName = topOfStack.methodName;
										superFunc.as = function (_trope) {
											if (!(_trope instanceof Trope) && typeof _trope === FUNCTION && _trope.trope) {
												_trope = _trope.trope;
											}
											if (_trope.isPrivate) {
												targetCtx = getPrivateCtx();
											} else {
												targetCtx = pubCtx;
											}
											return function () {
												var returnValue;
												if (_trope.inherits) {
													superStack.push({ func: _trope.inherits.finalProto[superFuncName], trope: _trope.inherits, isMethod: true, methodName: superFuncName });
												} else {
													superStack.push({ func: null, trope: null, isMethod: true, methodName: superFuncName });
												}
												returnValue = _trope.finalProto[superFuncName].apply(targetCtx, arguments);
												superStack.pop();
												return returnValue;
											};
										};
										return superFunc;
									}
								}
							}
						});*/
					}
				}

				if (!isSuper) {
					trope.forEachTropeInChain(function (currentTrope) {
						currentTrope.forEachMethod(function (method, methodName) {
							executionContext.addMethod(methodName, method, currentTrope);
							// var superMethod;
							// if (pubCtx.hasOwnProperty && pubCtx.hasOwnProperty(methodName)) {
							// 	superMethod = pubCtx[methodName];
							// }
							// pubCtx[methodName] = function () {
							// 	var args = arguments;
							// 	var returnValue;
							// 	superStack.push({ func: superMethod, trope: currentTrope, isMethod: true, methodName: methodName });
							// 	if (currentTrope.isPrivate) {
							// 		returnValue = method.apply(getPrivateCtx(), args);
							// 	} else {
							// 		returnValue = method.apply(pubCtx, args);
							// 	}
							// 	superStack.pop();
							// 	return returnValue;
							// };
						});
					});
				}
				/*if (!isSuper) {
					superStack = {
						stack: [],
						peek: function () {
							return this.stack[this.stack.length-1];
						},
						push: function (value) {
							return this.stack.push(value);
						},
						pop: function () {
							return this.stack.pop();
						}
					};

					// iterate over each method in the prototype chain to push super methods on the stack if necessary
					trope.forEachTropeInChain(function (currentTrope) {
						currentTrope.forEachMethod(function (method, methodName) {
							var superMethod;
								if (pubCtx.hasOwnProperty && pubCtx.hasOwnProperty(methodName)) {
									superMethod = pubCtx[methodName];
								}
								pubCtx[methodName] = function () {
									var args = arguments;
									var returnValue;
									superStack.push({ func: superMethod, trope: currentTrope, isMethod: true, methodName: methodName });
									if (currentTrope.isPrivate) {
										returnValue = method.apply(getPrivateCtx(), args);
									} else {
										returnValue = method.apply(pubCtx, args);
									}
									superStack.pop();
									return returnValue;
								};
						});
					});
				} else {
					var i;
					superStack = args[0];
					var newArgs = [];
					for (i=2; i<args.length; i++) {
						newArgs.push(args[i]);
					}
					args = newArgs;
				}*/

				if (!isSuper && trope.instanceContructor) {
					setNonEnumerableProperty(pubCtx, CONSTRUCTOR, trope.instanceContructor);
				}
				// superStack.push({ func: trope.superConstr, trope: trope.inherits, isConstructor: true });
				if (!isSuper) {
					trope.autoInitializeConfigs.forEach(function (autoinitConfig) {
						var autoinitTrope = autoinitConfig.trope;
						if (autoinitConfig.mode === AUTOINIT_CONSTRUCTOR) {
							// pubCtx.super.as(autoinitTrope).apply(null, args);
							// executionContext.getSuperFunctionAs(autoinitTrope).apply(null, args);
							executionContext.as(autoinitTrope).getConstructor().apply(null, args);

						} else if (autoinitConfig.mode === AUTOINIT_ARGS) {
							// pubCtx.super.as(autoinitTrope).apply(null, autoinitConfig.args);
							// executionContext.getSuperFunctionAs(autoinitTrope).apply(null, autoinitConfig.args);
							executionContext.as(autoinitTrope).getConstructor().apply(null, autoinitConfig.args);
						} else if (autoinitConfig.mode === AUTOINIT_INIT_FUNC) {
							// executionContext.getSuperFunctionAs(autoinitTrope).apply(null, autoinitConfig.args);
							executionContext.as(autoinitTrope).callAsConstructor(function (ctx) {
								autoinitConfig.initFunc.apply(ctx, args);
							});
							/*superStack.push({ func: autoinitTrope.superConstr, trope: autoinitTrope.inherits, isConstructor: true });
							if (autoinitTrope.isPrivate) {
								autoinitConfig.initFunc.apply(getPrivateCtx(), args);
							} else {
								autoinitConfig.initFunc.apply(pubCtx, args);
							}
							superStack.pop();*/
						}
					});
				}
				executionContext.callAsConstructor(function (ctx) {
					trope.constr.apply(ctx, args);
				});
				// trope.constr.apply(targetCtx, args);
				// superStack.pop();
				return executionContext.getPublicContext();
				// return pubCtx;
			};
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
		extend: function () {
			var trope = this;
			var args = arguments;
			var arity = args.length;
			var supportedArityHandler = arityMap[arity] || arityMap['?'];
			var def = supportedArityHandler.apply(arityMap, args);
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
	exports.Trope = Trope;

	function define (def) {
		var trope = new Trope(def);
		return trope.getConstructor();
	}
	exports.define = define;

	// possibly implement this as a state machine to get rid of useless combinations
	var arityMap = {
		'0': function () {},
		'1': function (arg0) {
			var arg0Type = typeof arg0;
			var def;
			if (arg0Type === OBJECT) {
				if (arg0 !== null && arg0.__TROPEDEF__) {
					def = arg0;
				} else {
					def = { prototype: arg0 };
				}
			} else if (arg0Type === FUNCTION) {
				if (arg0.trope) {
					def = arg0.trope.getDefinition();
				} else {
					def = { constructor: arg0 };
				}
			} else if (arg0Type === STRING) {
				def = { type: arg0 };
			}
			return def;
		},
		'2': function (arg0, arg1) {
			var arg0Type = typeof arg0;
			var arg1Type = typeof arg1;
			var def;
			if (arg0Type === OBJECT && arg0 !== null) {
				def = arg0;
			} else if (arg0Type === FUNCTION) {
				if (arg0.trope) {
					def = arg0.trope.getDefinition();
				} else {
					def = { constructor: arg0 };
				}
			} else if (arg0Type === STRING) {
				def = { type: arg0 };
			} else {
				def = {};
			}
			if (arg1Type === OBJECT) {
				def.prototype = arg1;
			} else if (arg1Type === FUNCTION) {
				if (arg1.trope) {
					def = mix(def, arg1.trope.getDefinition());
				} else {
					def.constructor = arg1;
				}
			} else if (arg1Type === STRING) {
				def.type = arg1;
			}
			return def;
		},
		'3': function (arg0, arg1, arg2) {
			var arg0Type = typeof arg0;
			var arg1Type = typeof arg1;
			var arg2Type = typeof arg2;
			var def;
			if (arg0Type === OBJECT && arg0 !== null) {
				def = arg0;
			} else if (arg0Type === FUNCTION) {
				if (arg0.trope) {
					def = arg0.trope.getDefinition();
				} else {
					def = { constructor: arg0 };
				}
			} else if (arg0Type === STRING) {
				def = { type: arg0 };
			} else {
				def = {};
			}
			if (arg1Type === OBJECT) {
				def.prototype = arg1;
			} else if (arg1Type === FUNCTION) {
				if (arg1.trope) {
					def = mix(def, arg1.trope.getDefinition());
				} else {
					def.constructor = arg1;
				}
			} else if (arg1Type === STRING) {
				def.type = arg1;
			}
			if (arg2Type === OBJECT) {
				def.prototype = arg2;
			} else if (arg2Type === FUNCTION) {
				if (arg2.trope) {
					def = mix(def, arg2.trope.getDefinition());
				} else {
					def.constructor = arg2;
				}
			} else if (arg2Type === STRING) {
				def.type = arg2;
			}
			return def;
		},
		'?': function () {
			return this['3'].apply(this, arguments);
		}
	};

	function Define () {
		var args = arguments;
		var arity = args.length;
		var supportedArityHandler = arityMap[arity] || arityMap['?'];
		var def = supportedArityHandler.apply(arityMap, args);
		return define(def);
	}
	exports.Define = Define;

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
	exports.instanceOf = instanceOf;

	applyAliases(exports, DEFINE_ALIAS, Define);

	return exports;
}());

module.exports = Trope;
//END trope.js
}));
