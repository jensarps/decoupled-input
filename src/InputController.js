/*global define:false */

/**
 * @license decoupled-input - Cross-Device Unified Input Handling
 * Copyright (c) 2012 - 2013 Jens Arps
 * Version 1.0.0
 *
 * Licensed under the MIT (X11) license
 */

define(function () {

  'use strict';

  /**
   * The InputController constructor
   *
   * This controller supervises the different device handlers and is the
   * interface to talk to.
   *
   * If you are using a built version of decoupled input, you'll get an
   * already instantiated InputController that has the device handlers
   * registered with.
   *
   * @constructor
   * @name InputController
   * @version 1.0.0
   * @example
    // working with a built version (default scenario):
    require([
      'input-controller',
      'my-bindings'
    ], function(
      inputController,
      bindings
    ){
      // inputController already is instantiated and ready to work with
      inputController.setBindings(bindings);

      // the input object is ready to use:
      var userInput = inputController.input;
    });
   * @example
    // using a custom setup:
    require([
      // the controller itself:
      '../src/InputController',
      // the device handlers:
      '../src/MouseHandler',
      '../src/KeyboardHandler',
      '../src/GamepadHandler',
      // and the bindings file:
      'my-bindings'
    ], function(
      InputController,
      MouseHandler,
      Keyboardhandler,
      GamepadHandler,
      bindings
    ){
      // Start input controller
      var inputController = new InputController();

      // register handlers
      inputController.registerDeviceHandlers([MouseHandler, Keyboardhandler, GamepadHandler]);

      // set options
      inputController.configureDeviceHandler('mouse', 'invertYAxis', true);

      // set bindings
      inputController.setBindings(bindings);

      // this is where we can read input data from:
      var input = inputController.input;
    });
   */
  var InputController = function () {
    this.deviceHandlers = {};
    this.bindings = {};
    this.input = {};
  };

  InputController.prototype = /** @lends InputController */ {

    /**
     * The version of InputController
     *
     * @type {String}
     */
    version: '1.0.0',

    /**
     * The internal representation of the current binding configuration
     *
     * @type {Object}
     */
    bindings: null,

    /**
     * An object containing the registered device handlers
     *
     * @type {Object}
     */
    deviceHandlers: null,

    /**
     * The object containing the actual user input
     *
     * @type {Object}
     */
    input: null,

    /**
     * Sets a new binding configuration and updates registered device handlers
     *
     * @param {Object} bindings The new binding configuration
     * @returns {void}
     */
    setBindings: function(bindings){
      this._processBindings(bindings);

      Object.keys(this.deviceHandlers).forEach(function (deviceName) {
        this.deviceHandlers[deviceName].bindings = this.bindings[deviceName] || {};
        this.deviceHandlers[deviceName].input = this.input;
      }, this);
    },

    /**
     * Parses the binding configuration and prepares the input object
     *
     * @param {Object} bindings The binding configuration
     * @returns {void}
     * @private
     */
    _processBindings: function (bindings) {
      var toString = {}.toString;

      Object.keys(bindings).forEach(function (description) {
        var binding = bindings[description],
            isMultiple = toString.call(binding) == '[object Array]';

        // set a default value; the value must be readable before
        // a user input occurs.
        this.input[description] = 0;

        if (isMultiple) {
          for (var i = 0, m = binding.length; i < m; i++) {
            var _binding = binding[i];
            this._applyBinding(_binding, description);
          }
        } else {
          this._applyBinding(binding, description);
        }
      }, this);
    },

    /**
     * Normalizes a single binding setup and adds it to the internal binding
     * representation
     *
     * @param {Object} binding A single binding setup
     * @param {String} description The string identifier of this binding
     * @returns {void}
     * @private
     */
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

    /**
     * Registers a device handler
     *
     * @param {Function} DeviceHandler The device handler class to register
     * @returns {void}
     */
    registerDeviceHandler: function (DeviceHandler) {
      var name = DeviceHandler.prototype.name;
      this.deviceHandlers[name] = new DeviceHandler(this.bindings[name] || {}, this.input);
    },

    /**
     * Registers multiple device handlers
     *
     * @param {Array} deviceHandlers An array of device handler classes
     * @returns {void}
     */
    registerDeviceHandlers: function (deviceHandlers) {
      deviceHandlers.forEach(this.registerDeviceHandler, this);
    },

    /**
     * Retrieves the instance of a registered device handler.
     *
     * @param {String} name The name of the device / device handler
     * @returns {DeviceHandler} The handler instance.
     * @example
        // obtain a reference to the mouse handler
        var mouseHandler = inputController.getDeviceHandler('mouse);
     */
    getDeviceHandler: function (name) {
      var handler = this.deviceHandlers[name];
      if (!handler) {
        throw new Error('No handler with the name "' + name + '" registered.');
      }
      return handler;
    },

    /**
     * Sets a property on a device handler
     *
     * @param {String} name The name of the handler to configure
     * @param {String} property The property name to configure
     * @param {*} value The new value for the property
     * @returns {Boolean} true if the configuration was successful
     */
    configureDeviceHandler: function (name, property, value) {
      var handler = this.getDeviceHandler(name);
      return handler.configure(property, value);
    },

    /**
     * Destroys the InputController and all registered device handlers
     *
     * @returns {void}
     */
    destroy: function () {
      Object.keys(this.deviceHandlers).forEach(function (deviceName) {
        this.deviceHandlers[deviceName].destroy();
      }, this);
      this.deviceHandlers = {};
    },

    /* detection methods */

    /**
     * Starts a detecting session
     *
     * @param {Function} callback A callback to be called when user input was
     *  detected
     * @returns {void}
     */
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

    /**
     * Stops a detecting session
     *
     * @returns {void}
     */
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
