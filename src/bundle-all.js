/*global define:false */
define([
  './InputController',
  './MouseHandler',
  './KeyboardHandler',
  './GamepadHandler',
  './SpeechHandler'
], function (InputController, MouseHandler, Keyboardhandler, GamepadHandler, SpeechHandler) {

  'use strict';

  var bundle = new InputController();

  bundle.registerDeviceHandlers([MouseHandler, Keyboardhandler, GamepadHandler, SpeechHandler]);

  return bundle;

});
