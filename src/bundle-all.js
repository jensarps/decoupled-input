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

  bundle.registerDeviceHandler(MouseHandler, 'mouse');
  bundle.registerDeviceHandler(Keyboardhandler, 'keyboard');
  bundle.registerDeviceHandler(GamepadHandler, 'gamepad');
  bundle.registerDeviceHandler(SpeechHandler, 'speechhandler');

  return bundle;

});
