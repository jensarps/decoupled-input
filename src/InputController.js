/*global define:false */
define(function () {

  'use strict';

  var InputController = function (bindings) {
    this.deviceHandlers = {};
    this.bindings = {};
    this.input = {};

    /*jshint expr:true */
    bindings && this.setupBindings(bindings);
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

    updateBindings: function(bindings){
      this.setupBindings(bindings);

      Object.keys(this.deviceHandlers).forEach(function (deviceName) {
        this.deviceHandlers[deviceName].bindings = this.bindings[deviceName] || {};
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
      };
    },

    registerDeviceHandler: function (DeviceHandler) {
      var name = DeviceHandler.prototype.name;
      this.deviceHandlers[name] = new DeviceHandler(this.bindings[name] || {}, this.input);
    },

    registerDeviceHandlers: function (deviceHandlers) {
      deviceHandlers.forEach(this.registerDeviceHandler, this);
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

    stopDetecting: function(){
      Object.keys(this.deviceHandlers).forEach(function (deviceName) {
        var deviceHandler = this.deviceHandlers[deviceName];
        deviceHandler._detectCallback = null;
        deviceHandler.isDetecting = false;
      }, this);
    }

  };

  return InputController;
});
