define(function(){

  /* This is an example bindings file */

  var KEYBOARD = 'keyboard',
      MOUSE = 'mouse',
      SPEECH = 'speech';

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
      inputId: 0, // left button
      down: true,
      up: true
    },

    toggleSomething: {
      device: KEYBOARD,
      inputId: 84, // t
      down: true,
      up: false
    },

    toggleSpeechInput: {
      device: KEYBOARD,
      inputId: 86, // v
      down: true,
      up: false
    },

    fullSpeed: {
      device: SPEECH,
      inputId: 'full speed'
    },

    stop: {
      device: SPEECH,
      inputId: 'stop'
    },

    slow: {
      device: SPEECH,
      inputId: 'slow'
    }
  };

  return bindings;
});
