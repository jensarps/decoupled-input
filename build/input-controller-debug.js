(function (name, definition, global) {
if (typeof define === 'function') {
define(definition);
} else if (typeof module !== 'undefined' && module.exports) {
module.exports = definition();
} else {
global[name] = definition();
}
})('inputController', function () {'use strict';var module$src$InputController = {}, InputController$$module$src$InputController = function $InputController$$module$src$InputController$() {
  this.deviceHandlers = {};
  this.bindings = {};
  this.input = {}
};
InputController$$module$src$InputController.prototype = {bindings:null, deviceHandlers:null, input:null, setBindings:function $InputController$$module$src$InputController$$setBindings$($bindings$$) {
  this._processBindings($bindings$$);
  Object.keys(this.deviceHandlers).forEach(function($deviceName$$) {
    this.deviceHandlers[$deviceName$$].bindings = this.bindings[$deviceName$$] || {};
    this.deviceHandlers[$deviceName$$].input = this.input
  }, this)
}, _processBindings:function $InputController$$module$src$InputController$$_processBindings$($bindings$$) {
  var $toString$$ = {}.toString;
  Object.keys($bindings$$).forEach(function($description$$) {
    var $binding$$ = $bindings$$[$description$$], $i$$ = "[object Array]" == $toString$$.call($binding$$);
    this.input[$description$$] = 0;
    if($i$$) {
      for(var $i$$ = 0, $m$$ = $binding$$.length;$i$$ < $m$$;$i$$++) {
        this._applyBinding($binding$$[$i$$], $description$$)
      }
    }else {
      this._applyBinding($binding$$, $description$$)
    }
  }, this)
}, _applyBinding:function $InputController$$module$src$InputController$$_applyBinding$($binding$$, $description$$) {
  this.bindings[$binding$$.device] || (this.bindings[$binding$$.device] = {});
  this.bindings[$binding$$.device][$binding$$.inputId] = {description:$description$$, down:!!$binding$$.down, up:!!$binding$$.up, invert:!!$binding$$.invert}
}, registerDeviceHandler:function $InputController$$module$src$InputController$$registerDeviceHandler$($DeviceHandler$$) {
  var $name$$ = $DeviceHandler$$.prototype.name;
  this.deviceHandlers[$name$$] = new $DeviceHandler$$(this.bindings[$name$$] || {}, this.input)
}, registerDeviceHandlers:function $InputController$$module$src$InputController$$registerDeviceHandlers$($deviceHandlers$$) {
  $deviceHandlers$$.forEach(this.registerDeviceHandler, this)
}, destroy:function $InputController$$module$src$InputController$$destroy$() {
  Object.keys(this.deviceHandlers).forEach(function($deviceName$$) {
    this.deviceHandlers[$deviceName$$].destroy()
  }, this);
  this.deviceHandlers = {}
}, startDetecting:function $InputController$$module$src$InputController$$startDetecting$($callback$$) {
  var $detectCallback$$ = function $$detectCallback$$$($evt$$) {
    $evt$$.timestamp = Date.now();
    $callback$$($evt$$)
  };
  Object.keys(this.deviceHandlers).forEach(function($deviceHandler_deviceName$$) {
    $deviceHandler_deviceName$$ = this.deviceHandlers[$deviceHandler_deviceName$$];
    $deviceHandler_deviceName$$._detectCallback = $detectCallback$$;
    $deviceHandler_deviceName$$.isDetecting = !0
  }, this)
}, stopDetecting:function $InputController$$module$src$InputController$$stopDetecting$() {
  Object.keys(this.deviceHandlers).forEach(function($deviceHandler$$1_deviceName$$) {
    $deviceHandler$$1_deviceName$$ = this.deviceHandlers[$deviceHandler$$1_deviceName$$];
    $deviceHandler$$1_deviceName$$._detectCallback = null;
    $deviceHandler$$1_deviceName$$.isDetecting = !1
  }, this)
}};
module$src$InputController.module$exports = InputController$$module$src$InputController;
module$src$InputController.module$exports && (module$src$InputController = module$src$InputController.module$exports);
var module$src$MouseHandler = {}, MouseHandler$$module$src$MouseHandler = function $MouseHandler$$module$src$MouseHandler$($bindings$$, $input$$) {
  this.bindings = $bindings$$;
  this.input = $input$$;
  this.input.mouseX = 0;
  this.input.mouseY = 0;
  var $hasPointerLockSupport$$ = !1, $pointerLockElementProperty$$ = null;
  ["webkitPointerLockElement", "mozPointerLockElement", "pointerLockElement"].forEach(function($propName$$) {
    $propName$$ in document && ($hasPointerLockSupport$$ = !0, $pointerLockElementProperty$$ = $propName$$)
  }, this);
  this.hasPointerLockSupport = $hasPointerLockSupport$$;
  this.pointerLockElementProperty = $pointerLockElementProperty$$;
  document.addEventListener("mousemove", this.moveListener = this.onMouseMove.bind(this), !1);
  document.addEventListener("mousedown", this.downListener = this.onMouseDown.bind(this), !1);
  document.addEventListener("mouseup", this.upListener = this.onMouseUp.bind(this), !1);
  document.addEventListener("contextmenu", (this.ctxListener = function $this$ctxListener$($evt$$) {
    $evt$$.preventDefault()
  }).bind(this), !1);
  window.addEventListener("resize", this.resizeListener = this.onResize.bind(this), !1);
  this.onResize()
};
MouseHandler$$module$src$MouseHandler.prototype = {name:"mouse", hasPointerLockSupport:!1, pointerLockElementProperty:null, movementProperty:"", infiniteXAxis:!1, infiniteYAxis:!1, width:0, height:0, onMouseMove:function $MouseHandler$$module$src$MouseHandler$$onMouseMove$($evt$$) {
  var $halfWidth_x$$, $halfHeight_y$$, $binding$$2_diffX_mouseX_width$$, $diffY_height$$;
  $binding$$2_diffX_mouseX_width$$ = this.width;
  $halfWidth_x$$ = $binding$$2_diffX_mouseX_width$$ / 2;
  $diffY_height$$ = this.height;
  $halfHeight_y$$ = $diffY_height$$ / 2;
  var $isPointerLocked$$ = this.hasPointerLockSupport && null !== document[this.pointerLockElementProperty];
  this._initialized || (["webkitMovement", "mozMovement", "movement"].forEach(function($propName$$) {
    $propName$$ + "X" in $evt$$ && (this.movementProperty = $propName$$)
  }, this), this.input.mouseX = $evt$$.pageX - ($isPointerLocked$$ ? $evt$$[this.movementProperty + "X"] : 0), this.input.mouseY = $evt$$.pageY - ($isPointerLocked$$ ? $evt$$[this.movementProperty + "Y"] : 0), this._initialized = !0);
  var $movementX$$ = $evt$$[this.movementProperty + "X"], $movementY$$ = $evt$$[this.movementProperty + "Y"];
  $isPointerLocked$$ ? ($binding$$2_diffX_mouseX_width$$ = this.clamp(0, $binding$$2_diffX_mouseX_width$$, this.input.mouseX + $movementX$$), $diffY_height$$ = this.clamp(0, $diffY_height$$, this.input.mouseY + $movementY$$)) : ($binding$$2_diffX_mouseX_width$$ = $evt$$.pageX, $diffY_height$$ = $evt$$.pageY);
  $halfWidth_x$$ = this.infiniteXAxis ? $isPointerLocked$$ ? $movementX$$ : $binding$$2_diffX_mouseX_width$$ - this.input.mouseX : -($binding$$2_diffX_mouseX_width$$ - $halfWidth_x$$) / $halfWidth_x$$;
  $halfHeight_y$$ = this.infiniteYAxis ? $isPointerLocked$$ ? $movementY$$ : $diffY_height$$ - this.input.mouseY : -($diffY_height$$ - $halfHeight_y$$) / $halfHeight_y$$;
  this.isDetecting ? ($binding$$2_diffX_mouseX_width$$ = Math.abs(this.input.mouseX - $binding$$2_diffX_mouseX_width$$), $diffY_height$$ = Math.abs(this.input.mouseY - $diffY_height$$), this._detectCallback({device:"mouse", inputId:$binding$$2_diffX_mouseX_width$$ > $diffY_height$$ ? "x" : "y", isAxis:!0})) : (this.input.mouseX = $binding$$2_diffX_mouseX_width$$, this.input.mouseY = $diffY_height$$, "x" in this.bindings && ($binding$$2_diffX_mouseX_width$$ = this.bindings.x, this.input[$binding$$2_diffX_mouseX_width$$.description] = 
  $binding$$2_diffX_mouseX_width$$.invert ? -1 * $halfWidth_x$$ : $halfWidth_x$$), "y" in this.bindings && ($binding$$2_diffX_mouseX_width$$ = this.bindings.y, this.input[$binding$$2_diffX_mouseX_width$$.description] = $binding$$2_diffX_mouseX_width$$.invert ? -1 * $halfHeight_y$$ : $halfHeight_y$$))
}, onMouseDown:function $MouseHandler$$module$src$MouseHandler$$onMouseDown$($binding$$3_evt$$) {
  this.isDetecting ? this._detectCallback({device:"mouse", inputId:$binding$$3_evt$$.button, isAxis:!1}) : $binding$$3_evt$$.button in this.bindings && ($binding$$3_evt$$ = this.bindings[$binding$$3_evt$$.button], $binding$$3_evt$$.down && (this.input[$binding$$3_evt$$.description] = 1))
}, onMouseUp:function $MouseHandler$$module$src$MouseHandler$$onMouseUp$($binding$$4_evt$$) {
  !this.isDetecting && $binding$$4_evt$$.button in this.bindings && ($binding$$4_evt$$ = this.bindings[$binding$$4_evt$$.button], $binding$$4_evt$$.up && (this.input[$binding$$4_evt$$.description] = 0))
}, onResize:function $MouseHandler$$module$src$MouseHandler$$onResize$() {
  this.width = window.innerWidth;
  this.height = window.innerHeight
}, clamp:function $MouseHandler$$module$src$MouseHandler$$clamp$($min$$, $max$$, $value$$) {
  return Math.min($max$$, Math.max($min$$, $value$$))
}, destroy:function $MouseHandler$$module$src$MouseHandler$$destroy$() {
  document.removeEventListener("mousemove", this.moveListener, !1);
  document.removeEventListener("mousedown", this.downListener, !1);
  document.removeEventListener("mouseup", this.upListener, !1);
  document.removeEventListener("contextmenu", this.ctxListener, !1);
  window.removeEventListener("resize", this.resizeListener, !1)
}};
module$src$MouseHandler.module$exports = MouseHandler$$module$src$MouseHandler;
module$src$MouseHandler.module$exports && (module$src$MouseHandler = module$src$MouseHandler.module$exports);
var module$build$bundle = {}, InputController$$module$build$bundle = module$src$InputController, MouseHandler$$module$build$bundle = module$src$MouseHandler, bundle$$module$build$bundle = new InputController$$module$build$bundle;
bundle$$module$build$bundle.registerDeviceHandlers([MouseHandler$$module$build$bundle]);
module$build$bundle.module$exports = bundle$$module$build$bundle;
module$build$bundle.module$exports && (module$build$bundle = module$build$bundle.module$exports);

return module$build$bundle; 
}, this);
