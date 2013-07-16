/*global define:false */
define([
  '../src/InputController',
  '../src/MouseHandler',
  '../src/KeyboardHandler'
], function (InputController, MouseHandler, KeyboardHandler) {

  'use strict';

  var bundle = new InputController();

  bundle.registerDeviceHandlers([MouseHandler, KeyboardHandler]);

  return bundle;

});
