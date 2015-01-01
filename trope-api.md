## Trope API
The trope module `Trope` is a function with additional properties.

* [`Trope()`](#trope) - default action, alias of [`Trope.interpret()`](#interpret)
* [`Trope.define()`](#define) - verbose Trope definition
* [`Trope.interpret()`](#interpret) - interprets arguments to build definition
* [`Trope.Trope`](#trope-constructor) - Trope object constructor
<!--* [`Trope.set()`](#section-trope-set) - extends Trope-->

--------------------------------
<a id="trope"></a>
### `Trope()`
#### Summary
The default `Trope()` function is an alias of [`Trope.interpret()`](#interpret).

--------------------------------
<a id="define"></a>
### `Trope.define`
#### Summary
Creates a new Trope and returns a constructor/factory function.
#### Syntax
```javascript
Trope.define(definitionObject)
```
#### Parameters
##### definitionObject
The only argument is the definition object, which can be used to pass in any trope option or configuration:

<a id="define-option-autoinit"></a>
- `autoinit` [boolean | Array | function]</div><br />
Normally, if extended, any parent tropes' [`constructor`](#define-option-constructor)/[`init`](#define-option-init) function have to be explicitly invoked with `this.super`, but this option will make sure it's invoked before the inheriting constructor executes. If set to `true`, it will be passed the same arguments that are passed to the inheriting trope. If set to an `Array`, it will always apply the array as the arguments to the [`constructor`](#define-option-constructor)/[`init`](#define-option-init) function. If passed a `function`, it will be executed instead of the normal [`constructor`](#define-option-constructor)/[`init`](#define-option-init) function when inherited.

<a id="define-option-constructor"></a>
- `constructor` [function]<br />
function used to initialize new objects. If `prototype` isn't specified, it will use the prototype property of this function. This is useful for converting native JS constructors into tropes.<br />
_alias:_ [`init`](#define-option-init)

<a id="define-option-extends"></a>
- `extends` [Trope/object/function]<br />
_alias:_ [`inherits`](#define-option-inherits)

<a id="define-option-inherits"></a>
- `inherits` [Trope/object/function]<br />
a Trope, object, or constructor function which the newly defined trope will inherit from. If it's not a trope, it will be converted into a trope first.<br />
_alias:_ [`extends`](#define-option-extends)

<a id="define-option-init"></a>
- `init` [function]<br />
_alias:_ [`constructor`](#define-option-constructor)

<a id="define-option-instance"></a>
- `instance` [string]<br />
string passed in will be used as the instance object name, useful for debugging and inspecting objects in a console. If not specified, the instance name will be the type name with a sub 'i' appended to it.

<a id="define-option-privacy"></a>
- `privacy` [boolean]<br />
flag which defines the trope in _privacy_ mode.

<a id="define-option-private"></a>
- `private` [object]<br />
the function properties of this object that will be made available to the trope's private context. Using this feature will automatically set the [`privacy`](#define-option-privacy) setting to `true`.

<a id="define-option-prototype"></a>
- `prototype` [object]<br />
an object used as the prototype for the definition. All function properties of this object will be exposed as methods of created objects. If not specified, it will use the prototype property of the [`constructor`](#define-option-constructor) function.<br />
_alias:_ [`public`](#define-option-public)

<a id="define-option-public"></a>
- `public` [object]<br />
_alias:_ [`prototype`](#define-option-prototype)

<a id="define-option-selfish"></a>
- `selfish` [boolean]<br />
boolean flag to enable the trope to be defined in _selfish_ mode. A trope defined in selfish mode will have the object's `this` reference bound to each function in the definition as the first parameter (like [Python classes](https://docs.python.org/2/tutorial/classes.html))

<a id="define-option-type"></a>
- `type` [string]<br />
the name of the Trope which can be useful when debugging. By default, the type name is the constructor function name if it exists, or 'Object'. If this Trope inherits from another, the default type name will be the same as the parent with a sub 'x' (for eXtended) appended to it.

#### Description
This is the most descriptive way to define a trope.

--------------------------------
<a id="interpret"></a>
### `Trope.interpret`
#### Summary
`Trope.interpret` can be used to to quickly define new Tropes without having to explicitly pass in a definition object. It internally builds up a definition object with the arguments passed in that would alternatively be used with [`Trope.define()`](#define).
#### Syntax
```javascript
Trope.interpret() // defines a blank trope
Trope.interpret([...definitionSetting])
```
#### Parameters
##### definitionSetting
This value can be an `object`, a `function`, a `string`, or another Trope. There can be any number of these as arguments.

As an `object`, it will be set as the `prototype` in the Trope definition. If more than one `object` is passed in, only the last one will be considered the prototype. The other `object` arguments will be combined into the trope definition. Use this leading `object` to pass in custom configurations to the trope (the same that would be passed into [`Trope.define()`](#define))

As a `function`, it will be set as the `init`/`constructor` function in the Trope definition.

As a `string`, it will be used as the `type` in the Trope definition.

As a Trope, the given trope's definition will be combined into the current trope's definition. If no other argument is passed in, the given trope will simply be returned (`Trope.interpret(SomeTrope) === SomeTrope`).

#### Description
[`Trope.interpret()`](#interpret) can be used like [`Trope.define()`](#define) to create a Trope.

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
Remember that sometimes it's good to be explicit and use [`Trope.define()`](#define) instead. The equivalent would be:
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
*Note that [`init`](#define-option-init) and [`public`](#define-option-public) are aliases for [`constructor`](#define-option-constructor) and [`prototype`](#define-option-prototype) respectively.*

--------------------------------
<a id="trope-constructor"></a>
### `Trope.Trope`
#### Summary
This is the raw Trope constructor which returns a Trope object.

#### Syntax
```javascript
new Trope.Trope(definitionObject);
```
#### Parameters
##### definitionObject
`definitionObject` is the same object that is accepted by [`Trope.define()`](#define).

#### Description
Using an actual Trope object like this is only useful when extending or testing Trope. [`Trope.define()`](#define) is descriptive enough to handle most needs.
<br/>
*Note: `(new Trope.Trope(definitionObject)).getConstructor()` is equivalent to `Trope.define(definitionObject)`.*

<!--

--------------------------------
<a id="section-trope-set"></a>
### `Trope.set()`
-->
