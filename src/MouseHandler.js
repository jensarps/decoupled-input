define(function(){

  var Mouse = function(bindings, input){
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

  Mouse.prototype = {

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

      this.input.mouseX = mouseX;
      this.input.mouseY = mouseY;

      if('x' in this.bindings){
        var binding = this.bindings.x;
        this.input[binding.description] = binding.invert ? x * -1 : x;
      }
      if('y' in this.bindings){
        var binding = this.bindings.y;
        this.input[binding.description] = binding.invert ? y * -1 : y;
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

  function clamp(min, max, value){
    return Math.min(max, Math.max(min, value));
  }

  return Mouse;
});
