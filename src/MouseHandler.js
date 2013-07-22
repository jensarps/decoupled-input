/*global define:false, document:false, window:false */
define(function(){

  'use strict';

  /**
   * The MouseHandler constructor
   *
   * NOTE: Don't call new MouseHandler() directly, instead pass the constructor
   * to the InputController's `registerDeviceHandler()` method.
   *
   * In general, you should not directly interact with an instance of a device
   * handler. The input controller does everything that needs to be done.
   *
   * To configure a MouseHandler instance, use the inputController's
   * `configureDeviceHandler();` method (see example).
   *
   * The MouseHandler's configurable properties are:
   * <ul>
   *   <li>infiniteXAxis</li>
   *   <li>infiniteYAxis</li>
   * </ul>
   *
   * @param {Object} bindings The bindings for this device
   * @param {Object} input A reference to the input object
   * @name MouseHandler
   * @constructor
   * @example
      // register the mouse handler on an existing inputController instance
      inputController.registerDeviceHandler(MouseHandler);

      // obtain a reference to the handler
      var mouseHandler = inputController.getDeviceHandler('mouse');

      // configure the mouse handler
      inputController.configureDeviceHandler('mouse', 'infiniteXAxis', true);
      // or, using the reference from above:
      mouseHandler.configure('infiniteXAxis', true);
   */
  var MouseHandler = function(bindings, input){
    this.bindings = bindings;
    this.input = input;

    this.input.mouseX = 0;
    this.input.mouseY = 0;

    var hasPointerLockSupport = false;
    var pointerLockElementProperty = null;
    [
      'webkitPointerLockElement',
      'mozPointerLockElement',
      'pointerLockElement'
    ].forEach(function(propName){
      if(propName in document){
        hasPointerLockSupport = true;
        pointerLockElementProperty = propName;
      }
    }, this);
    this.hasPointerLockSupport = hasPointerLockSupport;
    this.pointerLockElementProperty = pointerLockElementProperty;

    document.addEventListener('mousemove', ( this.moveListener = this.onMouseMove.bind(this) ), false);
    document.addEventListener('mousedown', ( this.downListener = this.onMouseDown.bind(this) ), false);
    document.addEventListener('mouseup', ( this.upListener = this.onMouseUp.bind(this) ), false);
    document.addEventListener('contextmenu', ( this.ctxListener = function(evt){ evt.preventDefault(); }).bind(this), false);
    window.addEventListener('resize', ( this.resizeListener = this.onResize.bind(this) ), false);
    this.onResize();
  };

  MouseHandler.prototype = /** @lends MouseHandler */ {

    /**
     * The name of the device to handle. This name must be unique to this
     * handler and serves two purposes (see examples).
     *
     * @type {String}
     * @example
        // 1. The instance of this handler can be accessed via this name from
        // the input controller instance like this:
        var mouseHandler = inputController.getDeviceHandler('mouse');
     * @example
        // 2. In the bindings configurations all bindings for this device must
        // have this name in the `device` property:
        var bindings = {
          steering: {
            device: 'mouse',
            inputId: 'x'
          }
        }
     */
    name: 'mouse',

    /**
     * The properties that are configurable for this handler
     *
     * @type {String[]}
     */
    configurableProperties: ['infiniteXAxis', 'infiniteYAxis'],

    /**
     * If the browser has support for the pointer lock API
     *
     * @type {Boolean}
     */
    hasPointerLockSupport: false,

    /**
     * The name of the property that points to the pointer lock element
     *
     * @type {String}
     */
    pointerLockElementProperty: null,

    /**
     * The name of the property that holds the movement data in mousemove events
     * if pointer lock is enabled
     *
     * @type {String}
     */
    movementProperty: '',

    /**
     * Whether the x axis should be treated as infinite. Defaults to false.
     *
     * Set this to true if you are using pointer lock and want to not restrict
     * mouse movement to the borders of the computer screen.
     *
     * @type {Boolean}
     */
    infiniteXAxis: false,

    /**
     * Whether the y axis should be treated as infinite. Defaults to false.
     *
     * Set this to true if you are using pointer lock and want to not restrict
     * mouse movement to the borders of the computer screen.
     *
     * @type {Boolean}
     */
    infiniteYAxis: false,

    /**
     * Stores the current window width
     *
     * @type {Number}
     */
    width: 0,

    /**
     * Stores the current window height
     *
     * @type {Number}
     */
    height: 0,

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
     * Handles mouse movement
     *
     * @param {MouseEvent} evt
     */
    onMouseMove: function(evt){
      var x, y, mouseX, mouseY,
          width = this.width,
          halfWidth = width / 2,
          height = this.height,
          halfHeight = height / 2,
          isPointerLocked = this.hasPointerLockSupport && document[this.pointerLockElementProperty] !== null;

      if(!this._initialized){

        ['webkitMovement', 'mozMovement', 'movement'].forEach(function(propName){
          if(propName + 'X' in evt){
            this.movementProperty = propName;
          }
        }, this);

        this.input.mouseX = evt.pageX - ( isPointerLocked ? evt[this.movementProperty + 'X'] : 0 );
        this.input.mouseY = evt.pageY - ( isPointerLocked ? evt[this.movementProperty + 'Y'] : 0 );
        this._initialized = true;
      }

      var movementX = evt[this.movementProperty + 'X'];
      var movementY = evt[this.movementProperty + 'Y'];

      if(isPointerLocked){
        mouseX = this.clamp(0, width, this.input.mouseX + movementX);
        mouseY = this.clamp(0, height, this.input.mouseY + movementY);
      }else{
        mouseX = evt.pageX;
        mouseY = evt.pageY;
      }

      x = this.infiniteXAxis ?
        ( isPointerLocked ? movementX : mouseX - this.input.mouseX ) :
        -( mouseX - halfWidth  ) / halfWidth;
      y = this.infiniteYAxis ?
        ( isPointerLocked ? movementY : mouseY - this.input.mouseY ) :
        -( mouseY - halfHeight ) / halfHeight;

      if(this.isDetecting){
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

      var binding;
      if('x' in this.bindings){
        binding = this.bindings.x;
        this.input[binding.description] = binding.invert ? x * -1 : x;
      }
      if('y' in this.bindings){
        binding = this.bindings.y;
        this.input[binding.description] = binding.invert ? y * -1 : y;
      }
    },

    /**
     * Handles mouse down events
     *
     * @param {MouseEvent} evt
     */
    onMouseDown: function(evt){
      if(this.isDetecting){
        this._detectCallback({
          device: 'mouse',
          inputId: evt.button,
          isAxis: false
        });
        return;
      }
      if(evt.button in this.bindings){
        var binding = this.bindings[evt.button];
        if(binding.down){
          this.input[binding.description] = 1;
        }
      }
    },

    /**
     * Handles mouse up events
     *
     * @param {MouseEvent} evt
     */
    onMouseUp: function(evt){
      if(this.isDetecting){
        return;
      }
      if(evt.button in this.bindings){
        var binding = this.bindings[evt.button];
        if(binding.up){
          this.input[binding.description] = 0;
        }
      }
    },

    /**
     * Updates window width and height on window resize
     */
    onResize: function(){
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    },

    /**
     * Clamps a value between a minimum and maximum value
     *
     * @param {Number} min The min value
     * @param {Number} max The max value
     * @param {Number} value The value to clamp
     * @returns {number} The clamped number
     */
    clamp: function (min, max, value){
      return Math.min(max, Math.max(min, value));
    },

    /**
     * Destroys all event listeners
     *
     * Called by the input controller's destroy() method.
     */
    destroy: function(){
      document.removeEventListener('mousemove', this.moveListener, false);
      document.removeEventListener('mousedown', this.downListener, false);
      document.removeEventListener('mouseup', this.upListener, false);
      document.removeEventListener('contextmenu', this.ctxListener, false);
      window.removeEventListener('resize', this.resizeListener, false);
    }

  };

  return MouseHandler;
});
