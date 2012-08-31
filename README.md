#About

decoupled-input is a flexible and lightweight input controller for games that allows to separate input listeners for different devices from the actual input computing logic.

This allows to change input bindings and devices without having to change the program logic; e.g. if the "fire" action was bound to the space key and it should later be bound to a mouse button, the change is only being made in the bindings configuration, and the game logic remains entirely unaffected.

Other benefits are:

* Code gets more readable
* Interpretation of input happens in the render loop
* Boolean and analog axis input can be handled by the same code

decoupled-input comes with handlers for mouse and keyboard (and as soon as I have a gamepad successfully connected to my machine, a gamepad handler will follow).


#How It Works

_(For full example code and bindings please see the [Examples](#examples) section.)_

The decoupled-input modules come in AMD format. There two types of modules: a controller and device handlers. To work, there is also a binding configuration needed.

An input setup looks like this:

~~~javascript

var inputController = new InputController(bindings);
inputController.registerDeviceHandler(MouseHandler, 'mouse');
inputController.registerDeviceHandler(Keyboardhandler, 'keyboard');

var input = inputController.input; // this is where all input is stored

// later:
if(input.accelerate){
  // accelerate something
}

~~~

#Device Handlers

_(For full example code and bindings please see the [Examples](#examples) section.)_

Device handlers connect to events and feed values back to the controller. There are two handlers bundled, but you could easily write your own handlers.

Device handlers must be passed to the controller instance's `registerDeviceHandler` method, along with the device name -- this device name must be the same string as the corresponding device name in the binding configuration.

A device handler instance is available in the controller instance under it's device name property, e.g. to set handling options:

~~~javascript

inputController.registerDeviceHandler(MouseHandler, 'mouse');

inputController.deviceHandlers.mouse.invertYAxis = true;

~~~

The mouse device handler has four configurable options that can be changed anytime (i.e. also during runtime):

* invertXAxis
* invertYaxis
* infiniteXAxis
* infiniteYAxis

By default, all are set to false. The invert[X/Y]Axis properties will invert the values for an axis. The infinite[X/Y]Axis properties will change the reporting of an axis value from the default schema (-1..1) to a diff schema, i.e. the reported value will be the diff from the last measured position for that axis. This is especially useful for FPS-like input when pointer lock is enabled. For more info on this, refer to the Pointer Lock section.

The First Person style example uses infiniteXAxis, and the fly style example uses invertYAxis.


#Bindings Configuration

_(For full example code and bindings please see the [Examples](#examples) section.)_

A binding configuration looks like this:

~~~javascript

var bindings = {

  forward: {
    device: 'keyboard', // the device name
    inputId: 87, // the input id; for keyboards, the char code
    down: true, // if the controller should act on down state
    up: true // if the controller should act on up state
  },

  fire: {
    device: 'mouse', // the device name
    inputId: 'button', // currently, only the left mouse button is supported
    down: true, // if the controller should act on down state
    up: true // if the controller should act on up state
  },
  
  pitch: {
    device: 'mouse', // the device name
    inputId: 'y' // axis input is either x or y
    // no up/down properties need to be provided for axis bindings
  }
}

~~~

An entry in the bindings object is an object itself, containing all information about the key/button/axis to be bound. The property name of the entry (e.g. "forward" in the example above) is where the corresponding input value can be found in the input object. In the example above, to check whether the key has been pressed, one would check for `input.forward`.

Every entry must provide four properties (except for axis bindings, see below):

* `device`: The device name, corresponding to the device name passed with the device handler
* `inputId`: The key/button/axis to bind. For keyboard devices, pass the key code of the key, as found in the `keyCode` property in mousedown events. For mouse buttons, pass the button id: `0` for the left button, `1` for the middle button and `2` for the right button. For axis bindings, pass `'x'` or `'y'`.
* `down`: [NOTE: Needs to be provided only for keys or buttons] Whether the input controller should react to a downstate of the key/button. In most cases, this should be `true` (in fact, I can't really think of a scenario where you would want this to be false, but, hey, I don't know, so you can configure it).
* `up`: [NOTE: Needs to be provided only for keys or buttons] Whether the input controller should react to a upstate of the key/button. In most cases, this should be `true`; except for bindings that are used to toggle something (see section [Toggle Buttons](#toggle-buttons) below for details).


#The Input Object

_(For full example code and bindings please see the [Examples](#examples) section.)_

All user input is gathered and available in the inputController's input object. A specific input's property name is the name specified in the bindings config and the value always is a number. All values are numeric; button/keyboard values are either 1 or 0, axis values range from -1 to 1.

This allows:

* boolean checks on buttons
* easy mathematical operations for button and axis input values

~~~javascript

// doing some math:
speed += (input.accelerate - input.brake) / 50;
speed = THREE.Math.clamp(speed, -0.5, 1);

// boolean check:
if (input.boost) {
  speed *= 1.5;
}

~~~


The mouse device handler also adds two extra properties to the input object:

* mouseX
* mouseY

Both values always carry the current mouse position, also in locked pointer mode. You can use these values, if you, e.g. are running your game in fullscreen with pointer lock enabled and still want to display a cursor.


#Examples

There are three examples available to see how it works, along with three example bindings. All input handling logic happens in the `render` function. 

_Note that these examples are just meant to demonstrate how to work with bindings and read input values. They are neither visually compelling, nor a recommended implementation of modifying the camera position._

* [First-Person style](http://jensarps.github.com/decoupled-input/example/example-first-person.html) | [code](https://github.com/jensarps/decoupled-input/blob/master/example/example-first-person.html) | [bindings](https://github.com/jensarps/decoupled-input/blob/master/example/bindings-fps.js) -- This example uses `infiniteXAxis`
* [Car style](http://jensarps.github.com/decoupled-input/example/example-car.html) | [code](https://github.com/jensarps/decoupled-input/blob/master/example/example-car.html) | [bindings](https://github.com/jensarps/decoupled-input/blob/master/example/bindings-car.js)
* [Fly style](http://jensarps.github.com/decoupled-input/example/example-fly.html) | [code](https://github.com/jensarps/decoupled-input/blob/master/example/example-fly.html) | [bindings](https://github.com/jensarps/decoupled-input/blob/master/example/bindings-fly.js) -- This example uses `invertedYAxis`


## PointerLock / infinite[X/Y]Axis

decoupled-input supports locked mouse pointers and abstracts away event property differences. If you are using infinite[X/Y]Axis, you will always get the mouse movement diff - whether pointer lock is enabled or not. So you don't have to worry about that in your game logic. However, when using infinite[X/Y]Axis, you will have to reset the input value in the render loop after reading it:

~~~javascript

  // The input `turn` is an x axis with infiniteXAxis

  // handle the value
  camera.rotation.y -= input.turn / SCREEN_WIDTH * 2;
  
  // reset it
  input.turn = 0;
  
~~~

The reason for that is simple: Mouse move events report movement, so the movement diff will almost never be zero (no diff == no movement == no event). That means even though the user has stopped moving the mouse, the last value reported by the handler will most probably be non-zero -- which is just wrong. 

## Toggle buttons

Using button input to toggle something on and off (like a visual display) is a common scenario. decoupled-input supports this, but you need to tell the bindings to only listen to the down state only and reset the input value yourself in your render loop after using it:

~~~javascript

// in the bindings file:

toggleSomething: {
  device: KEYBOARD,
  inputId: 84, // t
  down: true,
  up: false
}

// in the render loop:

if(input.toggleSomething){
    visualisationNodes.wrapper.classList.toggle('hidden');
    input.toggleSomething = 0;
}

~~~

The reason for this is simple as well: when a user presses a button -- no matter how quick -- the time this takes will almost certainly cover multiple render loops. So if you don't reset yourself, your toggle logic will be executed over and over again, in every loop -- until the user releases the button.

##Dependecies

None. Well, an AMD loader should be available.

##License

MIT. For details, see the `LICENSE` file in the repository.
