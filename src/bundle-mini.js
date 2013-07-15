/*global define:false */
define([
  '../src/InputController',
  '../src/MouseHandler',
  '../src/KeyboardHandler'
], function (InputController, MouseHandler, Keyboardhandler) {

  'use strict';

  var inputController = new InputController();

  inputController.registerDeviceHandler(MouseHandler, 'mouse');
  inputController.registerDeviceHandler(Keyboardhandler, 'keyboard');

  return inputController;

});
