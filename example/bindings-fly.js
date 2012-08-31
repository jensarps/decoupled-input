define(function(){

  /* This is an example bindings file */

  var KEYBOARD = 'keyboard',
      MOUSE = 'mouse';

  var bindings = {

    accelerate: {
      device: KEYBOARD,
      inputId: 87, // w
      down: true,
      up: true
    },

    decelerate: {
      device: KEYBOARD,
      inputId: 83, // s
      down: true,
      up: true
    },

    boost: {
      device: MOUSE,
      inputId: 0,
      down: true,
      up: true
    },

    pitch: {
      device: MOUSE,
      inputId: 'y'
    },

    roll: {
      device: MOUSE,
      inputId: 'x'
    },

    toggleSomething: {
      device: KEYBOARD,
      inputId: 84, // t
      down: true,
      up: false
    }
  };

  return bindings;
});
