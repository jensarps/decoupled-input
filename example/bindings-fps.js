define(function(){

  /* This is an example bindings file */

  var KEYBOARD = 'keyboard',
      MOUSE = 'mouse';

  var bindings = {

    forward: {
      device: KEYBOARD,
      inputId: 87, // w
      down: true,
      up: true
    },

    backward: {
      device: KEYBOARD,
      inputId: 83, // s
      down: true,
      up: true
    },

    strafeLeft: {
      device: KEYBOARD,
      inputId: 65, // a
      down: true,
      up: true
    },

    strafeRight: {
      device: KEYBOARD,
      inputId: 68, // d
      down: true,
      up: true
    },

    turn: {
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
