#About

decoupled-input is a flexible and lightweight input controller for games that allows to separate input listeners for different devices from the actual input computing logic.

This allows to change input bindings and devices without having to change the program logic; e.g. if the "fire" action was bound to the space key and it should later be bound to a mouse button, the change is only being made in the bindings configuration, and the game logic remains entirely unaffected.

Other benefits are:

* Code gets more readable
* Interpretation of input happens in the render loop
* Boolean (button/key) and analog axis input can be handled by the same code
* Easy setup of multiple bindings for one action
* Gamepad support!

decoupled-input comes with handlers for mouse, keyboard and gamepad.


#How It Works

_(For full example code and bindings please see the [Examples](#examples) section.)_

The decoupled-input modules come in AMD format. There two types of modules: a controller and device handlers. To work, there is also a binding configuration needed.

If you're not into working with modules, you can grab the `input.js` file from the `build` directory and iclude it via a `<script>` tag. That file contains all needed modules and exposes them to global using the names found in the example below.

An input setup looks like this:

~~~javascript

var inputController = new InputController(bindings);
inputController.registerDeviceHandler(GamepadHandler, 'gamepad');
inputController.registerDeviceHandler(MouseHandler, 'mouse');
inputController.registerDeviceHandler(KeyboardHandler, 'keyboard');
inputController.registerDeviceHandler(SpeechHandler, 'speech');

var input = inputController.input; // this is where all input is stored

// later:
if(input.accelerate){
  // accelerate something
}

~~~

#Bindings Configuration

_(For full example code and bindings please see the [Examples](#examples) section.)_

A binding configuration looks like this:

~~~javascript

var bindings = {

  forward: {
    device: 'keyboard', // the device name
    inputId: 87, // the input id; for keyboards, the key code
    down: true, // if the controller should act on down state
    up: true // if the controller should act on up state
  },

  roll: {
    device: 'gamepad', // the device name
    inputId: 'axis-0', // the input id; see below for details
  },

  fire: {
    device: 'mouse', // the device name
    inputId: 0, // which mouse button: left = 0, middle = 1, right = 2
    down: true, // if the controller should act on down state
    up: true // if the controller should act on up state
  },
  
  pitch: {
    device: 'mouse', // the device name
    inputId: 'y' // axis input is either x or y
    invert: true // if the axis should be inverted
  }
}

~~~

An entry in the bindings object is an object itself, containing all information about the key/button/axis to be bound. The property name of the entry (e.g. "forward" in the example above) is where the corresponding input value can be found in the input object. In the example above, to check whether the key has been pressed, one would check for `input.forward`.

Every entry consists of the following properties:

* `device`: The device name, corresponding to the device name passed with the device handler
* `inputId`: The key/button/axis to bind. For keyboard devices, pass the key code of the key, as found in the `keyCode` property in mousedown events. For mouse buttons, pass the button id: `0` for the left button, `1` for the middle button and `2` for the right button. For mouse axis bindings, pass `'x'` or `'y'`. For gamepads, please see the [GamepadHandler](#gamepadhandler) section.
* `down`: [NOTE: Needs to be provided only for keys or buttons] Whether the input controller should react to a downstate of the key/button. In most cases, this should be `true` (in fact, I can't really think of a scenario where you would want this to be false, but, hey, I don't know, so you can configure it).
* `up`: [NOTE: Needs to be provided only for keys or buttons] Whether the input controller should react to a upstate of the key/button. In most cases, this should be `true`; except for bindings that are used to toggle something (see section [Toggle Buttons](#toggle-buttons) below for details).
* `invert`: [NOTE: Not needed for keys or buttons] Whether the axis should be inverted. The fly example uses inverted y axis.

##Assigning multiple input options

To e.g. assign multiple keys to one action, just provide an array with all possible bindings for the action:

~~~javascript

var bindings = {

    forward: [
      {
        device: KEYBOARD,
        inputId: 87, // w
        down: true,
        up: true
      },
      {
        device: KEYBOARD,
        inputId: 38, // cursor up
        down: true,
        up: true
      }
    ]
}

~~~

The FPS example uses multiple assignments.

##Updating the binding configuration

To update the binding configuration during runtime, just call the controller's `setBindings()` method with the new bindings:

~~~javascript

// user toggled y-axis inversion off
bindings.pitch.invert = false;

// now update the controller
inputController.setBindings(bindings);

~~~



#The `Input` Object

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


#Device Handlers

_(For full example code and bindings please see the [Examples](#examples) section.)_

Device handlers connect to events and feed values back to the controller. There are three handlers bundled, but you could easily write your own handlers.

Device handlers must be passed to the controller instance's `registerDeviceHandler` method, along with the device name -- this device name must be the same string as the corresponding device name in the binding configuration.

A device handler instance is available in the controller instance under it's device name property, e.g. to set handling options:

~~~javascript

inputController.registerDeviceHandler(MouseHandler, 'mouse');

inputController.deviceHandlers.mouse.infiniteXAxis = true;

~~~

##GamepadHandler

The gamepad device handler has one configurable option that can be changed anytime (i.e. also during runtime):

* deadzone

The deadzone is a threshold that describes when an alomost-centered stick should be reported as centered. Analog sticks are rarely exactly centered and constantly report minimal changes even if the user doesn't move it, and you don't want your logic to react to that. By default this value is set to `0.01`. This value should work fine in most cases.

###Input IDs

Analog and digital sticks, as well as buttons on gamepads are not normalized. Therefore, axis and button input ids are provided as strings in a numbered fashion. 

Axes are provided like this: `'axis-0'`, `'axis-1'`, etc. and buttons like this: `'button-0'`, `'button-1'`, etc.

On the Xbox 360 wired controller, the left analog stick feeds axes 0 and 1, with 0 being the x axis and 1 being the y axis. However, this does not have to be the case for other gamepads.


##MouseHandler

The mouse device handler has two configurable options that can be changed anytime (i.e. also during runtime):

* infiniteXAxis
* infiniteYAxis

By default, both are set to false. The infinite[X/Y]Axis properties will change the reporting of an axis value from the default schema (-1..1) to a diff schema, i.e. the reported value will be the diff from the last measured position for that axis. This is especially useful for FPS-like input when pointer lock is enabled. For more info on this, refer to the Pointer Lock section.

The First Person style example uses infiniteXAxis.

##SpeechHandler

The speech device handler has two configurable options that can be changed anytime (i.e. also during runtime):

* lang
* requiredConfidence

`lang` defaults to `'en_US`' and denotes the speech recognition language. `requiredConfidence` defaults to `0.5` and denotes the minimum recognition confidence that will handle the transcript as a match.

The speech handler also has two methods, `start` and `stop` to control when recognition happens. As the recognition may end without having called `stop`, you can assign an event handler to the `onRecognitionEnded` property, which will be called when the API has stopped recognizing.

The Car style example /w speech bindings uses speech input.


#Examples

There are three examples available to see how it works, along with three example bindings. All input handling logic happens in the `render` function. 

_Note that these examples are just meant to demonstrate how to work with bindings and read input values. They are neither visually compelling, nor a recommended implementation of modifying the camera position._

* [First-Person style](http://jensarps.github.com/decoupled-input/example/example-first-person.html) | [code](https://github.com/jensarps/decoupled-input/blob/master/example/example-first-person.html) | [bindings](https://github.com/jensarps/decoupled-input/blob/master/example/bindings-fps.js) -- This example uses `infiniteXAxis`
* [Car style](http://jensarps.github.com/decoupled-input/example/example-car.html) | [code](https://github.com/jensarps/decoupled-input/blob/master/example/example-car.html) | [bindings](https://github.com/jensarps/decoupled-input/blob/master/example/bindings-car.js)
* [Fly style](http://jensarps.github.com/decoupled-input/example/example-fly.html) | [code](https://github.com/jensarps/decoupled-input/blob/master/example/example-fly.html) | [bindings](https://github.com/jensarps/decoupled-input/blob/master/example/bindings-fly.js) -- This example uses `invert: true` for it's y-axis and has gamepad bindings.
* [Car style w/ speech bindings](http://jensarps.github.com/decoupled-input/example/example-speech.html) | [code](https://github.com/jensarps/decoupled-input/blob/master/example/example-speech.html) | [bindings](https://github.com/jensarps/decoupled-input/blob/master/example/bindings-car.js) -- This example is like the car style example but has speech bindings.


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

##Gamepad support

The Gamepad API still is highly experimental. However, the fly example uses gamepad bindings and works fine with my setup: An Xbox 360 wired controller on Mac OSX Lion. Axis and button mappings are probably different for other controllers. If you encounter any issues with your gamepad, or have any observations or insights to share, don't hesitate to file a bug in the issue tracker.

##Web Speech API

The speech handler uses the Web Speech API, which is currently only supported in Chrome 25+, and is to be considered experimental.

##Dependecies

None. Well, an AMD loader should be available.

##License

MIT. For details, see the `LICENSE` file in the repository.
