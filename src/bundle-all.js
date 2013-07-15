/*global define:false */
define([
  './InputController',
  './MouseHandler',
  './KeyboardHandler',
  './GamepadHandler',
  './SpeechHandler'
], function (InputController, MouseHandler, Keyboardhandler, GamepadHandler, SpeechHandler) {

  'use strict';

  var inputController = new InputController();

  inputController.registerDeviceHandler(MouseHandler, 'mouse');
  inputController.registerDeviceHandler(Keyboardhandler, 'keyboard');
  inputController.registerDeviceHandler(GamepadHandler, 'gamepad');
  inputController.registerDeviceHandler(SpeechHandler, 'speechhandler');

  return inputController;

});
