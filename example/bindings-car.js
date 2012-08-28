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

    brake: {
      device: KEYBOARD,
      inputId: 83, // s
      down: true,
      up: true
    },

    steering: {
      device: MOUSE,
      inputId: 'x'
    },

    boost: {
      device: MOUSE,
      inputId: 'button',
      down: true,
      up: true
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
