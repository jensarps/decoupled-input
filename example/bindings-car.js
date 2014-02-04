define(function(){

  /* This is an example bindings file */

  var bindings = {

    accelerate: {
      device: 'keyboard',
      inputId: 'w',
      down: true,
      up: true
    },

    brake: {
      device: 'keyboard',
      inputId: 's',
      down: true,
      up: true
    },

    steering: {
      device: 'mouse',
      inputId: 'x'
    },

    boost: {
      device: 'mouse',
      inputId: 0, // left button
      down: true,
      up: true
    },

    toggleSomething: {
      device: 'keyboard',
      inputId: 't',
      down: true,
      up: false
    },

    toggleSpeechInput: {
      device: 'keyboard',
      inputId: 'v',
      down: true,
      up: false
    },

    fullSpeed: {
      device: 'speech',
      inputId: 'full speed'
    },

    stop: {
      device: 'speech',
      inputId: 'stop'
    },

    slow: {
      device: 'speech',
      inputId: 'slow'
    }
  };

  return bindings;
});
