/*global define:false, window:false, navigator:false */
/**
 * Gamepad polling code taken from this fantastic article by Marcin Wichary:
 *
 * http://www.html5rocks.com/en/tutorials/doodles/gamepad/
 */
define(function () {

  'use strict';

  /**
   * The GamepadHandler constructor, leveraging the Gamepad API
   * <br><br>
   * NOTE: Don't call new GamepadHandler() directly, instead pass the constructor
   * to the InputController's `registerDeviceHandler()` method.
   * <br><br>
   * In general, you should not directly interact with an instance of a device
   * handler. The input controller does everything that needs to be done.
   * <br><br>
   * To configure a GamepadHandler instance, use the inputController's
   * `configureDeviceHandler();` method (see example).
   *
   * The GamepadHandler's configurable properties are:
   * <ul>
   *   <li>deadzone (defaults to 0.01)</li>
   * </ul>
   *
   * @see https://dvcs.w3.org/hg/gamepad/raw-file/default/gamepad.html
   * @param {Object} bindings The bindings for this device
   * @param {Object} input A reference to the input object
   * @name GamepadHandler
   * @constructor
   * @example
      // register the gamepad handler on an existing inputController instance
      inputController.registerDeviceHandler(GamepadHandler);

      // obtain a reference to the handler
      var gamepadHandler = inputController.getDeviceHandler('gamepad');

      // configure the speech handler
      inputController.configureDeviceHandler('gamepad', 'deadzone', 0.01);
      // or, using the reference from above:
      gamepadHandler.configure('deadzone', 0.01);
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

  GamepadHandler.prototype = /** @lends GamepadHandler */ {
    /**
     * The name of the device to handle. This name must be unique to this
     * handler and serves two purposes (see examples).
     *
     * @type {String}
     * @example
        // 1. The instance of this handler can be accessed via this name from
        // the input controller instance like this:
        var gamepadHandler = inputController.getDeviceHandler('gamepad');
        inputController.configureDeviceHandler('gamepad', 'deadzone', 0.01);
     * @example
        // 2. In the bindings configurations all bindings for this device must
        // have this name in the `device` property:
        var bindings = {
          pitch: {
            device: 'gamepad',
            inputId: 'axis-1'
          }
        }
     */
    name: 'gamepad',

    /**
     * The properties that are configurable for this handler
     *
     * @type {String[]}
     */
    configurableProperties: ['deadzone'],

    /**
     * The deadzone of the gamepad, i.e. the value that an axis' movement must
     * be larger than to be reported by the handler. Defaults to 0.01
     *
     * @type {Number}
     */
    deadzone: 0.01,

    /**
     * A collection of button states
     *
     * @type {Array}
     */
    buttonStates: null,

    /**
     * A collection of axis values
     *
     * @type {Array}
     */
    axisValues: null,

    /**
     * A collection of connected gamepads
     *
     * @type {Array}
     */
    gamepads: null,

    /**
     * Whether polling of gamepads is currently active
     *
     * @type {Boolean}
     */
    isPolling: false,

    /**
     * A collection of the types of connected gamepads
     *
     * @type {Array}
     */
    prevRawGamepadTypes: null,

    /**
     * A collection of timestamps used during polling
     *
     * @type {Array}
     */
    prevTimestamps: null,

    /**
     * Configures a configurable option
     *
     * @param {String} property The property name to configure
     * @param {*} value The new value
     * @returns {Boolean} true if configuration was successful
     */
    configure: function(property, value){
      if (this.configurableProperties.indexOf(property) === -1) {
        throw new Error('Property ' + property + ' is not configurable.');
      }
      this[property] = value;
      return true;
    },

    /**
     * Initializes the handler
     */
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

    /**
     * Called when a gamepad is connected
     *
     * @param {Event} evt The event containing data about the connected gamepad
     */
    onGamepadConnect: function (evt) {
      this.gamepads.push(evt.gamepad);
      this.startPolling();
    },

    /**
     * Called when gamepad gets disconnected
     *
     * @param {Event} evt The disconnect event
     */
    onGamepadDisconnect: function (evt) {
      for (var i = this.gamepads - 1; i >= 0; i--) {
        if (this.gamepads[i].index == evt.gamepad.index) {
          this.gamepads.splice(i, 1);
          break;
        }
      }
      if (this.gamepads.length === 0) {
        this.stopPolling();
      }
    },

    /**
     * Starts polling connected gamepads for changes
     */
    startPolling: function () {
      if (!this.isPolling) {
        this.isPolling = true;
        this.tick();
      }
    },

    /**
     * Stops polling connected gamepads
     */
    stopPolling: function () {
      this.isPolling = false;
    },

    /**
     * The polling loop
     */
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

    /**
     * Checks for updates in gamepad states
     */
    pollStatus: function () {
      this.pollGamepads();
      for (var i = 0, m = this.gamepads.length; i<m; i++) {
        var gamepad = this.gamepads[i];
        if (gamepad.timestamp && (gamepad.timestamp == this.prevTimestamps[i])) {
          continue;
        }
        this.prevTimestamps[i] = gamepad.timestamp;
        this.onStatusChanged(i);
      }
    },

    /**
     * Reads the button and axis state of connected gamepads
     */
    pollGamepads: function () {
      var rawGamepads = (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) || navigator.webkitGamepads;
      var i,m;

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

          for(i= 0, m=this.gamepads.length; i<m; i++){
            var gamepad = this.gamepads[i];

            var states = this.buttonStates[i] = [];
            gamepad.buttons.forEach(function(initialValue, index){
              states[index] = initialValue;
            }, this);

            var values = this.axisValues[i] = [];
            gamepad.axes.forEach(function(initialValue, index){
              values[index] = Math.abs(initialValue) > this.deadzone ? initialValue : 0;
            }, this);
          }

        }
      }
    },

    /**
     * Called when a change in a gamepad's state is detected
     *
     * @param {Number} gamepadId The id of the gamepad that had a change
     */
    onStatusChanged: function (gamepadId) {

      var gamepad = this.gamepads[gamepadId];
      var states = this.buttonStates[gamepadId];
      var values = this.axisValues[gamepadId];

      var i, m,binding;

      for(i = 0, m = gamepad.buttons.length; i<m; i++){
        var currentValue = gamepad.buttons[i];
        var oldValue = states[i];
        var buttonId = 'button-' + i;

        if(oldValue != currentValue ){

          if(this.isDetecting){
            this._detectCallback({
              device: 'gamepad',
              inputId: buttonId,
              isAxis: false
            });
          } else {
            var type = currentValue > oldValue ? 'down' : 'up';

            if(buttonId in this.bindings){
              binding = this.bindings[buttonId];
              if(binding[type]){
                this.input[binding.description] = currentValue;
              }
            }
          }
          states[i] = currentValue;

        }
      }

      for(i = 0, m=gamepad.axes.length; i<m; i++){

        var value = gamepad.axes[i];
        if(Math.abs(value) <= this.deadzone){
          value = 0;
        }
        var axisId = 'axis-' + i;

        if(this.isDetecting && values[i] != value){
          this._detectCallback({
            device: 'gamepad',
            inputId: axisId,
            isAxis: true
          });
        } else {
          if(axisId in this.bindings){
            binding = this.bindings[axisId];
            if(binding.invert){
              value *= -1;
            }
            this.input[binding.description] = value;
          }
        }
        values[i] = value;

      }
    },

    /**
     * Destroys all event listeners
     */
    destroy: function(){
      this.stopPolling();
      window.removeEventListener('MozGamepadConnected', this.connectListener, false);
      window.removeEventListener('MozGamepadDisconnected', this.disconnectListener, false);
    }

  };

  return GamepadHandler;

});
