define(function () {

  var InputController = function (bindings) {
    this.bindings = {};
    this.deviceHandlers = {};
    this.input = {};
    this.setupBindings(bindings);
  };

  InputController.prototype = {

    bindings: null,

    deviceHandlers: null,

    input: null,

    setupBindings: function (bindings) {
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
      this.deviceHandlers[deviceName] = new DeviceHandler(this.bindings[deviceName], this.input);
    },

    destroy: function () {
      Object.keys(this.deviceHandlers).forEach(function (deviceName) {
        this.deviceHandlers[deviceName].destroy();
      }, this);
    }

  };

  return InputController;
});
