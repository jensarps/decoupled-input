var InputController = function (bindings) {
  this.deviceHandlers = {};
  this.setupBindings(bindings);
};

InputController.prototype = {

  bindings: null,

  deviceHandlers: null,

  input: null,

  setupBindings: function (bindings) {
    this.bindings = {};
    this.input = {};

    Object.keys(bindings).forEach(function (description) {
      var binding = bindings[description],
        toString = ({}).toString;

      // set a default value; the value must be readable before
      // a user input occurs.
      this.input[description] = 0;

      if (toString.call(binding) == '[object Array]') {
        for (var i = 0, m = binding.length; i < m; i++) {
          var _binding = binding[i];
          this._applyBinding(_binding, description);
        }
      } else {
        this._applyBinding(binding, description);
      }
    }, this);
  },

  updateBindings: function (bindings) {
    this.setupBindings(bindings);

    Object.keys(this.deviceHandlers).forEach(function (deviceName) {
      this.deviceHandlers[deviceName].bindings = this.bindings[deviceName] || {};
      this.deviceHandlers[deviceName].input = this.input;
    }, this);
  },

  _applyBinding: function (binding, description) {
    if (!this.bindings[binding.device]) {
      this.bindings[binding.device] = {};
    }
    this.bindings[binding.device][binding.inputId] = {
      description: description,
      down: !!binding.down,
      up: !!binding.up,
      invert: !!binding.invert
    }
  },

  registerDeviceHandler: function (DeviceHandler, deviceName) {
    this.deviceHandlers[deviceName] = new DeviceHandler(this.bindings[deviceName] || {}, this.input);
  },

  destroy: function () {
    Object.keys(this.deviceHandlers).forEach(function (deviceName) {
      this.deviceHandlers[deviceName].destroy();
    }, this);
  },

  /* detection methods */
  startDetecting: function (callback) {
    var detectCallback = function (evt) {
      evt.timestamp = Date.now();
      callback(evt);
    };

    Object.keys(this.deviceHandlers).forEach(function (deviceName) {
      var deviceHandler = this.deviceHandlers[deviceName];
      deviceHandler._detectCallback = detectCallback;
      deviceHandler.isDetecting = true;
    }, this);
  },

  stopDetecting: function () {
    Object.keys(this.deviceHandlers).forEach(function (deviceName) {
      var deviceHandler = this.deviceHandlers[deviceName];
      deviceHandler._detectCallback = null;
      deviceHandler.isDetecting = false;
    }, this);
  }

};


var KeyboardHandler = function (bindings, input) {
  this.bindings = bindings;
  this.input = input;

  document.addEventListener('keyup', ( this.upListener = this.onKeyUp.bind(this) ), false);
  document.addEventListener('keydown', ( this.downListener = this.onKeyDown.bind(this) ), false);
};

KeyboardHandler.prototype = {

  isDetecting: false,

  onKeyDown: function (evt) {
    if (this.isDetecting) {
      this._detectCallback({
        device: 'keyboard',
        inputId: evt.keyCode,
        isAxis: false
      });
      return;
    }
    if (evt.keyCode in this.bindings) {
      var binding = this.bindings[evt.keyCode];
      if (binding.down) {
        this.input[binding.description] = 1;
      }
    }
  },

  onKeyUp: function (evt) {
    if (this.isDetecting) {
      return;
    }
    if (evt.keyCode in this.bindings) {
      var binding = this.bindings[evt.keyCode];
      if (binding.up) {
        this.input[binding.description] = 0;
      }
    }
  },

  destroy: function () {
    document.removeEventListener('keyup', this.upListener, false);
    document.removeEventListener('keydown', this.downListener, false);
  }

};

var MouseHandler = function (bindings, input) {
  this.bindings = bindings;
  this.input = input;

  this.input.mouseX = 0;
  this.input.mouseY = 0;

  document.addEventListener('mousemove', ( this.moveListener = this.onMouseMove.bind(this) ), false);
  document.addEventListener('mousedown', ( this.downListener = this.onMouseDown.bind(this) ), false);
  document.addEventListener('mouseup', ( this.upListener = this.onMouseUp.bind(this) ), false);
  document.addEventListener('contextmenu', ( this.ctxListener = function (evt) {
    evt.preventDefault();
  }).bind(this), false);
  window.addEventListener('resize', ( this.resizeListener = this.onResize.bind(this) ), false);
  this.onResize();
};

MouseHandler.prototype = {

  infiniteXAxis: false,

  infiniteYAxis: false,

  width: 0,

  height: 0,

  onMouseMove: function (evt) {
    var x, y, mouseX, mouseY,
      width = this.width,
      halfWidth = width / 2,
      height = this.height,
      halfHeight = height / 2;

    if (document.pointerLockEnabled) {
      mouseX = this.clamp(0, width, this.input.mouseX + evt.movementX);
      mouseY = this.clamp(0, height, this.input.mouseY + evt.movementY);
    } else {
      mouseX = evt.pageX;
      mouseY = evt.pageY;
    }

    x = this.infiniteXAxis ?
      ( document.pointerLockEnabled ? evt.movementX : mouseX - this.input.mouseX ) :
      -( mouseX - halfWidth  ) / halfWidth;
    y = this.infiniteYAxis ?
      ( document.pointerLockEnabled ? evt.movementY : mouseY - this.input.mouseY ) :
      -( mouseY - halfHeight ) / halfHeight;

    if (this.isDetecting) {
      var diffX = Math.abs(this.input.mouseX - mouseX);
      var diffY = Math.abs(this.input.mouseY - mouseY);
      this._detectCallback({
        device: 'mouse',
        inputId: diffX > diffY ? 'x' : 'y',
        isAxis: true
      });
      return;
    }

    this.input.mouseX = mouseX;
    this.input.mouseY = mouseY;

    if ('x' in this.bindings) {
      var binding = this.bindings.x;
      this.input[binding.description] = binding.invert ? x * -1 : x;
    }
    if ('y' in this.bindings) {
      var binding = this.bindings.y;
      this.input[binding.description] = binding.invert ? y * -1 : y;
    }
  },

  onMouseDown: function (evt) {
    if (this.isDetecting) {
      this._detectCallback({
        device: 'mouse',
        inputId: evt.button,
        isAxis: false
      });
      return;
    }
    if (evt.button in this.bindings) {
      var binding = this.bindings[evt.button];
      if (binding.down) {
        this.input[binding.description] = 1;
      }
    }
  },

  onMouseUp: function (evt) {
    if (this.isDetecting) {
      return;
    }
    if (evt.button in this.bindings) {
      var binding = this.bindings[evt.button];
      if (binding.up) {
        this.input[binding.description] = 0;
      }
    }
  },

  onResize: function () {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  },

  clamp: function (min, max, value) {
    return Math.min(max, Math.max(min, value));
  },

  destroy: function () {
    document.removeEventListener('mousemove', this.moveListener, false);
    document.removeEventListener('mousedown', this.downListener, false);
    document.removeEventListener('mouseup', this.upListener, false);
    document.removeEventListener('contextmenu', this.ctxListener, false);
    window.removeEventListener('resize', this.resizeListener, false);
  }

};

/**
 * Gamepad polling code taken from this fantastic article by Marcin Wichary:
 *
 * http://www.html5rocks.com/en/tutorials/doodles/gamepad/
 */

var GamepadHandler = function (bindings, input) {
  this.bindings = bindings;
  this.input = input;

  this.gamepads = [];
  this.prevRawGamepadTypes = [];
  this.prevTimestamps = [];
  this.buttonStates = [];
  this.axisValues = [];

  this.init();
};

GamepadHandler.prototype = {

  deadzone: 0.01,

  buttonStates: null,

  axisValues: null,

  gamepads: null,

  isPolling: false,

  prevRawGamepadTypes: null,

  prevTimestamps: null,

  init: function () {

    var isAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads || (navigator.userAgent.indexOf('Firefox/') != -1);

    if (isAvailable) {
      window.addEventListener('MozGamepadConnected', ( this.connectListener = this.onGamepadConnect.bind(this) ), false);
      window.addEventListener('MozGamepadDisconnected', ( this.disconnectListener = this.onGamepadDisconnect.bind(this) ), false);
      if (!!navigator.webkitGamepads || !!navigator.webkitGetGamepads) {
        this.startPolling();
      }
    }
  },

  onGamepadConnect: function (evt) {
    this.gamepads.push(evt.gamepad);
    this.startPolling();
  },

  onGamepadDisconnect: function (evt) {
    for (var i = this.gamepads - 1; i >= 0; i--) {
      if (this.gamepads[i].index == evt.gamepad.index) {
        this.gamepads.splice(i, 1);
        break;
      }
    }
    if (this.gamepads.length == 0) {
      this.stopPolling();
    }
  },

  startPolling: function () {
    if (!this.isPolling) {
      this.isPolling = true;
      this.tick();
    }
  },

  stopPolling: function () {
    this.isPolling = false;
  },

  tick: function () {
    if (this.isPolling) {
      var tick = this.tick.bind(this);
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(tick);
      } else if (window.mozRequestAnimationFrame) {
        window.mozRequestAnimationFrame(tick);
      } else if (window.webkitRequestAnimationFrame) {
        window.webkitRequestAnimationFrame(tick);
      }
    }

    this.pollStatus();
  },

  pollStatus: function () {
    this.pollGamepads();
    for (var i = 0, m = this.gamepads.length; i < m; i++) {
      var gamepad = this.gamepads[i];
      if (gamepad.timestamp && (gamepad.timestamp == this.prevTimestamps[i])) {
        continue;
      }
      this.prevTimestamps[i] = gamepad.timestamp;
      this.onStatusChanged(i);
    }
  },

  pollGamepads: function () {
    var rawGamepads = (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) || navigator.webkitGamepads;
    var i, m;

    if (rawGamepads) {
      this.gamepads.length = 0;
      var gamepadsChanged = false;
      for (i = 0, m = rawGamepads.length; i < m; i++) {
        if (typeof rawGamepads[i] != this.prevRawGamepadTypes[i]) {
          gamepadsChanged = true;
          this.prevRawGamepadTypes[i] = typeof rawGamepads[i];
        }
        if (rawGamepads[i]) {
          this.gamepads.push(rawGamepads[i]);
        }
      }
      if (gamepadsChanged) {

        this.buttonStates.length = 0;
        this.axisValues.length = 0;

        for (i = 0, m = this.gamepads.length; i < m; i++) {
          var gamepad = this.gamepads[i];

          var states = this.buttonStates[i] = [];
          gamepad.buttons.forEach(function (initialValue, index) {
            states[index] = initialValue;
          }, this);

          var values = this.axisValues[i] = [];
          gamepad.axes.forEach(function (initialValue, index) {
            values[index] = Math.abs(initialValue) > this.deadzone ? initialValue : 0;
          }, this);
        }

      }
    }
  },

  onStatusChanged: function (gamepadId) {

    var gamepad = this.gamepads[gamepadId];
    var states = this.buttonStates[gamepadId];
    var values = this.axisValues[gamepadId];

    var i, m, binding;

    for (i = 0, m = gamepad.buttons.length; i < m; i++) {
      var currentValue = gamepad.buttons[i];
      var oldValue = states[i];
      var buttonId = 'button-' + i;

      if (oldValue != currentValue) {

        if (this.isDetecting) {
          this._detectCallback({
            device: 'gamepad',
            inputId: buttonId,
            isAxis: false
          });
        } else {
          var type = currentValue > oldValue ? 'down' : 'up';

          if (buttonId in this.bindings) {
            binding = this.bindings[buttonId];
            if (binding[type]) {
              this.input[binding.description] = currentValue;
            }
          }
        }
        states[i] = currentValue;

      }
    }

    for (i = 0, m = gamepad.axes.length; i < m; i++) {

      var value = gamepad.axes[i];
      if (Math.abs(value) <= this.deadzone) {
        value = 0;
      }
      var axisId = 'axis-' + i;

      if (this.isDetecting && values[i] != value) {
        this._detectCallback({
          device: 'gamepad',
          inputId: axisId,
          isAxis: true
        });
      } else {
        if (axisId in this.bindings) {
          binding = this.bindings[axisId];
          if (binding.invert) {
            value *= -1;
          }
          this.input[binding.description] = value;
        }
      }
      values[i] = value;

    }
  },

  destroy: function () {
    window.removeEventListener('MozGamepadConnected', this.connectListener, false);
    window.removeEventListener('MozGamepadDisconnected', this.disconnectListener, false);
  }

};


