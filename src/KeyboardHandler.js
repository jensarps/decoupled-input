/*global define:false, document:false */
define(function(){

  'use strict';

  /**
   * The KeyboardHandler constructor
   * <br><br>
   * NOTE: Don't call new KeyboardHandler() directly, instead pass the constructor
   * to the InputController's `registerDeviceHandler()` method.
   * <br><br>
   * In general, you should not directly interact with an instance of a device
   * handler. The input controller does everything that needs to be done.
   * <br><br>
   * The KeyboardHandler has no configurable options.
   *
   * @param {Object} bindings The bindings for this device
   * @param {Object} input A reference to the input object
   * @name KeyboardHandler
   * @constructor
   * @example
      // register the keyboard handler on an existing inputController instance
      inputController.registerDeviceHandler(KeyboardHandler);

      // obtain a reference to the handler
      var keyboardHandler = inputController.getDeviceHandler('keyboard');
   */
  var KeyboardHandler = function(bindings, input){
    this.bindings = bindings;
    this.input = input;

    document.addEventListener('keyup', ( this.upListener = this.onKeyUp.bind(this) ), false);
    document.addEventListener('keydown', ( this.downListener = this.onKeyDown.bind(this) ), false);
  };

  KeyboardHandler.prototype = /** @lends KeyboardHandler */ {

    /**
     * The name of the device to handle. This name must be unique to this
     * handler and serves two purposes (see examples).
     *
     * @type {String}
     * @example
        // 1. The instance of this handler can be accessed via this name from
        // the input controller instance like this:
        var keyboardHandler = inputController.getDeviceHandler('keyboard');
     * @example
        // 2. In the bindings configurations all bindings for this device must
        // have this name in the `device` property:
        var bindings = {
          up: {
            device: 'keyboard',
            inputId: '83'
          }
        }
     */
    name: 'keyboard',

    /**
     * The properties that are configurable for this handler
     *
     * @type {String[]}
     */
    configurableProperties: [],

    /**
     * Whether the handler is in detecting mode
     *
     * @type {Boolean}
     */
    isDetecting: false,

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
     * Handles keydown events
     *
     * @param {KeyboardEvent} evt
     * @returns {void}
     */
    onKeyDown: function(evt){
      if(this.isDetecting){
        this._detectCallback({
          device: 'keyboard',
          inputId: evt.keyCode,
          isAxis: false
        });
        return;
      }
      if(evt.keyCode in this.bindings){
        var binding = this.bindings[evt.keyCode];
        if(binding.down){
          this.input[binding.description] = 1;
        }
      }
    },

    /**
     * Handles keyup events
     *
     * @param {KeyboardEvent} evt
     * @returns {void}
     */
    onKeyUp: function(evt){
      if(this.isDetecting){
        return;
      }
      if(evt.keyCode in this.bindings){
        var binding = this.bindings[evt.keyCode];
        if(binding.up){
          this.input[binding.description] = 0;
        }
      }
    },

    /**
     * Destroys all existing event listeners
     *
     * @returns {void}
     */
    destroy: function(){
      document.removeEventListener('keyup', this.upListener, false);
      document.removeEventListener('keydown', this.downListener, false);
    }

  };

  return KeyboardHandler;
});
