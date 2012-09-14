

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
      down: binding.down,
      up: binding.up
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

var KeyboardHandler = function(bindings, input){
  this.bindings = bindings;
  this.input = input;

  document.addEventListener('keyup', ( this.upListener = this.onKeyUp.bind(this) ), false);
  document.addEventListener('keydown', ( this.downListener = this.onKeyDown.bind(this) ), false);
};

KeyboardHandler.prototype = {

  onKeyDown: function(evt){
    if(evt.keyCode in this.bindings){
      var binding = this.bindings[evt.keyCode];
      if(binding.down){
        this.input[binding.description] = 1;
      }
    }
  },

  onKeyUp: function(evt){
    if(evt.keyCode in this.bindings){
      var binding = this.bindings[evt.keyCode];
      if(binding.up){
        this.input[binding.description] = 0;
      }
    }
  },

  destroy: function(){
    document.removeEventListener('keyup', this.upListener, false);
    document.removeEventListener('keydown', this.downListener, false);
  }
};

var MouseHandler = function(bindings, input){
  this.bindings = bindings;
  this.input = input;

  this.input.mouseX = 0;
  this.input.mouseY = 0;

  document.addEventListener('mousemove', ( this.moveListener = this.onMouseMove.bind(this) ), false);
  document.addEventListener('mousedown', ( this.downListener = this.onMouseDown.bind(this) ), false);
  document.addEventListener('mouseup', ( this.upListener = this.onMouseUp.bind(this) ), false);
  document.addEventListener('contextmenu', ( this.ctxListener = function(evt){ evt.preventDefault(); }).bind(this), false);
  window.addEventListener('resize', ( this.resizeListener = this.onResize.bind(this) ), false);
  this.onResize();
};

MouseHandler.prototype = {

  invertXAxis: false,

  invertYAxis: false,

  infiniteXAxis: false,

  infiniteYAxis: false,

  width: 0,

  height: 0,

  onMouseMove: function(evt){
    var x, y, mouseX, mouseY,
        width = this.width,
        halfWidth = width / 2,
        height = this.height,
        halfHeight = height / 2;

    function clamp(min, max, value){
      return Math.min(max, Math.max(min, value));
    }

    if(document.pointerLockEnabled){
      mouseX = clamp(0, width, this.input.mouseX + evt.movementX);
      mouseY = clamp(0, height, this.input.mouseY + evt.movementY);
    }else{
      mouseX = evt.pageX;
      mouseY = evt.pageY;
    }

    x = this.infiniteXAxis ?
      ( document.pointerLockEnabled ? evt.movementX : mouseX - this.input.mouseX ) :
      -( mouseX - halfWidth  ) / halfWidth;
    y = this.infiniteYAxis ?
      ( document.pointerLockEnabled ? evt.movementY : mouseY - this.input.mouseY ) :
      -( mouseY - halfHeight ) / halfHeight;

    if(this.invertXAxis){
      x *= -1;
    }
    if(this.invertYAxis){
      y *= -1;
    }

    this.input.mouseX = mouseX;
    this.input.mouseY = mouseY;

    if('x' in this.bindings){
      var binding = this.bindings.x;
      this.input[binding.description] = x;
    }
    if('y' in this.bindings){
      var binding = this.bindings.y;
      this.input[binding.description] = y;
    }
  },

  onMouseDown: function(evt){
    if(evt.button in this.bindings){
      var binding = this.bindings[evt.button];
      if(binding.down){
        this.input[binding.description] = 1;
      }
    }
  },

  onMouseUp: function(evt){
    if(evt.button in this.bindings){
      var binding = this.bindings[evt.button];
      if(binding.up){
        this.input[binding.description] = 0;
      }
    }
  },

  onResize: function(){
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  },

  destroy: function(){
    document.removeEventListener('mousemove', this.moveListener, false);
    document.removeEventListener('mousedown', this.downListener, false);
    document.removeEventListener('mouseup', this.upListener, false);
    document.removeEventListener('contextmenu', this.ctxListener, false);
    window.removeEventListener('resize', this.resizeListener, false);
  }
};
