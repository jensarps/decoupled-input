/*global define:false */
define(function () {

  'use strict';

  /**
   * The DeviceHandler interface.
   *
   * All device handlers must implement this.
   *
   * The constructor gets called by the input controller.
   *
   * @param {Object} bindings The binding configuration
   * @param {Object} input The input object
   * @name DeviceHandler
   * @constructor
   * @interface
   */
  var DeviceHandler = function (bindings, input) {
    this.bindings = bindings;
    this.input = input;
  };

  DeviceHandler.prototype = /** @lends DeviceHandler */ {

    /**
     * The device name. It must be unique to the handler.
     * @type {String}
     */
    name: 'device',

    /**
     * A list of configurable properties.
     * @type {String[]}
     */
    configurableProperties: [],

    /**
     * A reference to the input object
     * @type {Object}
     */
    input: null,

    /**
     * The bindings for this device
     * @type {Object}
     */
    bindings: null,

    /**
     * A method to set properties on the handler. Should check if properties are
     * configurable. Can be implemented as below (if just directly setting
     * properties on the instance).
     *
     * This method is called by the input controller.
     *
     * @param {String} property The name of the property to set
     * @param {*} value The new value for the property
     * @returns {boolean} true if configuration was successful.
     */
    configure: function (property, value) {
      if (this.configurableProperties.indexOf(property) === -1) {
        throw new Error('Property ' + property + ' is not configurable.');
      }
      this[property] = value;
      return true;
    },

    /**
     * Destroys this handlers. Must e.g. remove all created event listeners.
     *
     * This method is called by the input controller.
     *
     * @returns {void}
     */
    destroy: function () {
    }

  };

  return DeviceHandler;

});
