### [Trope API](#module-api)
The trope module `Trope` is a function with additional methods.

* [`Trope()`](#module-trope) - default action, alias of [`Trope.interpret()`](#interpret)
* [`Trope.define()`](#module-define) - verbose Trope definition
  * _aliases_:
  * [`Trope.class`](#module-define)
  * [`Trope.extend`](#module-define)
* [`Trope.interpret()`](#module-interpret) - interprets arguments to build definition
  * _aliases_:
  * [`Trope.proto`](#module-interpret)
  * [`Trope.turn`](#module-interpret)
  * [`Trope.link`](#module-interpret)
  * [`Trope.chain`](#module-interpret)
* [`Trope.Trope`](#module-trope-constructor) - Trope object constructor

### [Trope Constructor/Factory API](#factory-api)
A Trope Constructor/Factory is a function with additional methods and properties.

* [`Factory.define`](#factory-define)
  * _aliases_:
  * [`Factory.class`](#factory-define)
  * [`Factory.extend`](#factory-define)
* [`Factory.interpret`](#factory-interpret)
  * _aliases_:
  * [`Factory.proto`](#factory-interpret)
  * [`Factory.turn`](#factory-interpret)
  * [`Factory.link`](#factory-interpret)
  * [`Factory.chain`](#factory-interpret)
* [`Factory.trope`](#factory-trope)

<a id="module-api"></a>
## Trope API
--------------------------------
<a id="module-trope"></a>
### `Trope()`
#### Summary
The default `Trope()` function is an alias of [`Trope.interpret()`](#interpret).

--------------------------------
<a id="module-define"></a>
### `Trope.define`
_alias:_ `class`,`extend`

#### Summary
Creates a new Trope and returns a constructor/factory function.
#### Syntax
```javascript
Trope.define(definitionObject)
```
#### Parameters
##### definitionObject
The only argument is the definition object, which can be used to pass in any trope option or configuration:

<a id="module-define-option-autoinit"></a>
- `autoinit` [boolean | Array | function]</div><br />
Normally, if extended, any parent tropes' [`constructor`](#module-define-option-constructor)/[`init`](#module-define-option-init) function have to be explicitly invoked with `this.super`, but this option will make sure it's invoked before the inheriting constructor executes. If set to `true`, it will be passed the same arguments that are passed to the inheriting trope. If set to an `Array`, it will always apply the array as the arguments to the [`constructor`](#module-define-option-constructor)/[`init`](#module-define-option-init) function. If passed a `function`, it will be executed instead of the normal [`constructor`](#module-define-option-constructor)/[`init`](#module-define-option-init) function when inherited.

<a id="module-define-option-constructor"></a>
- `constructor` [function]<br />
function used to initialize new objects. If `prototype` isn't specified, it will use the prototype property of this function. This is useful for converting native JS constructors into tropes.<br />
_alias:_ [`init`](#module-define-option-init)

<a id="module-define-option-extends"></a>
- `extends` [Trope/object/function]<br />
_alias:_ [`inherits`](#module-define-option-inherits)

<a id="module-define-option-inherits"></a>
- `inherits` [Trope/object/function/Array]<br />
a Trope, object, or constructor function which the newly defined trope will inherit from. If it's not a trope, it will be converted into a trope first. If an Array, it will inherit from all elements of the Array.<br />
_alias:_ [`extends`](#module-define-option-extends)

<a id="module-define-option-init"></a>
- `init` [function]<br />
_alias:_ [`constructor`](#module-define-option-constructor)

<a id="module-define-option-instance"></a>
- `instance` [string]<br />
string passed in will be used as the instance object name, useful for debugging and inspecting objects in a console. If not specified, the instance name will be the type name with a sub 'i' appended to it.

<a id="module-define-option-privacy"></a>
- `privacy` [boolean]<br />
flag which defines the trope in _privacy_ mode.

<a id="module-define-option-private"></a>
- `private` [object]<br />
the function properties of this object that will be made available to the trope's private context. Using this feature will automatically set the [`privacy`](#module-define-option-privacy) setting to `true`.

<a id="module-define-option-prototype"></a>
- `prototype` [object]<br />
an object used as the prototype for the definition. All function properties of this object will be exposed as methods of created objects. If not specified, it will use the prototype property of the [`constructor`](#module-define-option-constructor) function.<br />
_alias:_ [`public`](#module-define-option-public)

<a id="module-define-option-public"></a>
- `public` [object]<br />
_alias:_ [`prototype`](#module-define-option-prototype)

<a id="module-define-option-selfish"></a>
- `selfish` [boolean]<br />
boolean flag to enable the trope to be defined in _selfish_ mode. A trope defined in selfish mode will have the object's `this` reference bound to each function in the definition as the first parameter (like [Python classes](https://docs.python.org/2/tutorial/classes.html))

<a id="module-define-option-type"></a>
- `type` [string]<br />
the name of the Trope which can be useful when debugging. By default, the type name is the constructor function name if it exists, or 'Object'. If this Trope inherits from another, the default type name will be the same as the parent with a sub 'x' (for eXtended) appended to it.

#### Description
This is the most descriptive way to define a trope.

--------------------------------
<a id="module-interpret"></a>
### `Trope.interpret`
_alias:_ `proto`,`turn`,`link`,`chain`

#### Summary
`Trope.interpret` can be used to to quickly define new Tropes without having to explicitly pass in a definition object. It internally builds up a definition object with the arguments passed in that would alternatively be used with [`Trope.define()`](#module-define).
#### Syntax
```javascript
Trope.interpret() // defines a blank trope
Trope.interpret([...definitionSetting])
```
#### Parameters
##### definitionSetting
This value can be an `object`, a `function`, a `string`, another Trope, or an `Array` of other Tropes. There can be any number of these as arguments.

As an `object`, it will be set as the `prototype` in the Trope definition. If more than one `object` is passed in, only the last one will be considered the prototype. The other `object` arguments will be combined into the trope definition. Use this leading `object` to pass in custom configurations to the trope (the same that would be passed into [`Trope.define()`](#module-define))

As a `function`, it will be set as the `init`/`constructor` function in the Trope definition.

As a `string`, it will be used as the `type` in the Trope definition.

As a Trope, the given trope's definition will be combined into the current trope's definition. If no other argument is passed in, the given trope will simply be returned (`Trope.interpret(SomeTrope) === SomeTrope`).

As an `Array` of Tropes, the new Trope will inherit from all the Tropes passed in to the array.

#### Description
[`Trope.interpret()`](#module-interpret) can be used like [`Trope.define()`](#module-define) to create a Trope.

For example,
```javascript
Trope.interpret('Greeter', function (name) {
	this.name = name;
}, {
	setName: function (name) {
		this.name = name;
	},
	sayHello: function () {
		return 'Hello, ' + this.name + '!';
	}
});
```
is equivalent to
```javascript
Trope.define({
	type: 'Greeter',
	constructor: function (name) {
		this.name = name;
	},
	prototype: {
		setName: function (name) {
			this.name = name;
		},
		sayHello: function () {
			return 'Hello, ' + this.name + '!';
		}
	}
});
```
If only one object is given, it will be interpreted as the prototype. In order to pass in extra options, you have to make sure to pass in another object anywhere before the prototype object:
```javascript
Trope.interpret({
	privacy: true,
	selfish: true
}, function Greeter (self, name) {
	self.name = name;
}, {
	setName: function (self, name) {
		self.name = name;
	},
	sayHello: function (self) {
		return 'Hello, ' + self.name + '!';
	}
});
```
Remember that sometimes it's good to be explicit and use [`Trope.define()`](#module-define) instead. The equivalent would be:
```javascript
Trope.define({
	privacy: true,
	selfish: true
	init: function Greeter (self, name) {
		self.name = name;
	},
	public: {
		setName: function (self, name) {
			self.name = name;
		},
		sayHello: function (self) {
			return 'Hello, ' + self.name + '!';
		}
	}
});
```
*Note that [`init`](#module-define-option-init) and [`public`](#module-define-option-public) are aliases for [`constructor`](#module-define-option-constructor) and [`prototype`](#module-define-option-prototype) respectively.*

--------------------------------
<a id="module-trope-constructor"></a>
### `Trope.Trope`
#### Summary
This is the raw Trope constructor which returns a Trope object.

#### Syntax
```javascript
new Trope.Trope(definitionObject);
```
#### Parameters
##### definitionObject
`definitionObject` is the same object that is accepted by [`Trope.define()`](#module-define).

#### Description
Using an actual Trope object like this is only useful when extending or testing Trope. [`Trope.define()`](#module-define) is descriptive enough to handle most needs.

*Note: `(new Trope.Trope(definitionObject)).getConstructor()` is equivalent to `Trope.define(definitionObject)`.*

<a id="factory-api"></a>
## Trope Constructor/Factory API
--------------------------------
<a id="factory-define"></a>
### `Factory.define`
_alias:_ `class`,`extend`

#### Summary
The `define` method of a trope factory defines a new Trope that inherits from the top-level Trope. It otherwise behaves exactly like [Trope.define](#module-define). If the new definition inherits from different Trope, it will [inherit from both](https://github.com/ogupte/trope#description-multiple-inheritance).

Returns a Trope constructor/factory.

#### Syntax
```javascript
var ChildFactory = SuperFactory.define(definitionObject)
```
#### Parameters
##### definitionObject
The expected object has exactly the same options as [Trope.define](#module-define).

#### Description
This function is an easy way to do inheritance since a child trope can be chained directy off a parent trope.

--------------------------------
<a id="factory-interpret"></a>
### `Factory.interpret`
_alias:_ `proto`,`turn`,`link`,`chain`

#### Summary
The `interpret` method of a trope factory defines a new Trope that inherits from the top-level Trope. It otherwise behaves exactly like [Trope.interpret](#module-interpret).

#### Syntax
```javascript
var ChildFactory = SuperFactory.interpret([...definitionSetting])
```
#### Parameters
##### definitionSetting
This value can be an `object`, a `function`, a `string`, or another Trope. There can be any number of these as arguments. The expected parameters are exactly the same that is expected of [Trope.interpret](#module-interpret).

#### Description
This is the easiest way to extend a trope since it will inherit from the top-level trope has a minimalist interface. [See examples](https://github.com/ogupte/trope#inheritance)

--------------------------------
<a id="factory-trope"></a>
### `Factory.trope`
#### Summary
The `trope` property is a reference to the Trope instance associated with the constructor/factory. A Trope instance is created with the [Trope.Trope](#module-trope-constructor) constructor.

#### Syntax
```javascript
Factory.trope // this is the object reference
Factory.trope instanceof Trope.Trope // true
```

#### Description
The `trope` property is only useful in very specific situations, usually only when extending the library.

--------------------------------
