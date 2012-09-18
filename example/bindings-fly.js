define(function(){

  /* This is an example bindings file */

  var KEYBOARD = 'keyboard',
      MOUSE = 'mouse',
      GAMEPAD = 'gamepad';

  var bindings = {

    accelerate: [
      {
        device: KEYBOARD,
        inputId: 87, // w
        down: true,
        up: true
      },
      {
        device: GAMEPAD,
        inputId: 'button-3', // 'Y'
        down: true,
        up: true
      }
    ],

    decelerate: [
      {
        device: KEYBOARD,
        inputId: 83, // s
        down: true,
        up: true
      },
      {
        device: GAMEPAD,
        inputId: 'button-0', // 'A'
        down: true,
        up: true
      }
    ],

    boost: {
      device: MOUSE,
      inputId: 0,
      down: true,
      up: true
    },

    pitch: [
      {
        device: MOUSE,
        inputId: 'y',
        invert: true
      },
      {
        device: GAMEPAD,
        inputId: 'axis-1'
      }
    ],

    roll: [
      {
        device: MOUSE,
        inputId: 'x'
      },
      {
        device: GAMEPAD,
        inputId: 'axis-0',
        invert: true
      }
    ],

    toggleSomething: {
      device: KEYBOARD,
      inputId: 84, // t
      down: true,
      up: false
    }
  };

  return bindings;
});
