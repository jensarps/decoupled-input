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

  bundle.registerDeviceHandler(MouseHandler);
  bundle.registerDeviceHandler(Keyboardhandler);
  bundle.registerDeviceHandler(GamepadHandler);
  bundle.registerDeviceHandler(SpeechHandler);

  return bundle;

});
