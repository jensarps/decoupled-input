/*global define:false, window: false */
define(function () {

  'use strict';

  /**
   * The SpeechHandler constructor, leveraging the Web Speech API
   *
   * NOTE: Don't call new SpeechHandler() directly, instead pass the constructor
   * to the InputController's `registerDeviceHandler()` method.
   *
   * In general, you should not directly interact with an instance of a device
   * handler. The input controller does everything that needs to be done.
   * There's two exceptions for this: You must call the handler's `start()`
   * and `stop()` methods to begin or end recognition (see example).
   *
   * To configure a SpeechHandler instance, use the inputController's
   * `configureDeviceHandler();` method (see example).
   *
   * The SpeechHandler's configurable properties are:
   * <ul>
   *   <li>language</li>
   *   <li>requiredConfidence</li>
   *   <li>onRecognitionEnded</li>
   * </ul>
   *
   * @see https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html
   * @param {Object} bindings The bindings for this device
   * @param {Object} input A reference to the input object
   * @name SpeechHandler
   * @constructor
   * @example
      // register the speech handler on an existing inputController instance
      inputController.registerDeviceHandler(SpeechHandler);

      // obtain a reference to the handler
      var speechHandler = inputController.getDeviceHandler('speech');

      // configure the speech handler
      inputController.configureDeviceHandler('speech', 'language', 'en-US');
      // or, using the reference from above:
      speechHandler.configure('language', 'en-US');

      // to start recognition:
      speechHandler.start();

      // to manually end recognition:
      speechHandler.stop();

      // to get notified when the speech handler stops recognition by itself:
      speechHandler.configure('onRecognitionEnded', function(){
        console.log('recognition has ended');
      });
   */
  var SpeechHandler = function (bindings, input) {
    this.bindings = bindings;
    this.input = input;

    if (!('webkitSpeechRecognition' in window)) {
      return; // sorry.
    }

    var SpeechRecognition = window.webkitSpeechRecognition;
    var rec = this.recognition = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = this._startHandler.bind(this);
    rec.onerror = this._errorHandler.bind(this);
    rec.onend = this._endHandler.bind(this);
    rec.onresult = this._resultHandler.bind(this);
  };

  SpeechHandler.prototype = /** @lends SpeechHandler */ {

    /**
     * The name of the device to handle. This name must be unique to this
     * handler and serves two purposes (see examples).
     *
     * @type {String}
     * @example
        // 1. The instance of this handler can be accessed via this name from
        // the input controller instance like this:
        var speechHandler = inputController.getDeviceHandler('speech');
        inputController.configureDeviceHandler('speech', 'language', 'en-US');
     * @example
        // 2. In the bindings configurations all bindings for this device must
        // have this name in the `device` property:
        var bindings = {
          stop: {
            device: 'speech',
            inputId: 'stop'
          }
        }
     */
    name: 'speech',

    /**
     * The properties that are configurable for this handler
     *
     * @type {String[]}
     */
    configurableProperties: ['language', 'requiredConfidence', 'onRecognitionEnded'],

    /**
     * A reference to the SpeechRecognition instance used
     *
     * @type {SpeechRecognition}
     */
    recognition: null,

    /**
     * Whether a recognition is currently running
     *
     * @type {Boolean}
     */
    isRecognizing: false,

    /**
     * Whether a new recognition may happen
     *
     * @type {Boolean}
     */
    isActive: false,

    /**
     * The input language, as a valid BCP 47 tag (also known as "ISO Language
     * Code" for some reason). For more details on this, see
     * http://www.ietf.org/rfc/bcp/bcp47.txt
     *
     * @type {String}
     */
    language: 'en-US',

    /**
     * The required confidence rating that will make the speech handler
     * treat a recognition result as a hit. Float in the range [0..1]
     *
     * @type {Number}
     */
    requiredConfidence: 0.5,

    /**
     * Called when the speech handler ends recognition by itself. Attach
     * a function to this property to get notified when this happens.
     *
     * @type {Function}
     */
    onRecognitionEnded: null,

    /**
     * Configures a configurable option
     *
     * @param {String} property The property name to configure
     * @param {*} value The new value
     * @returns {Boolean} true if configuration was successful
     */
    configure: function(property, value){
      if (this.configurableProperties.indexOf(property) === -1) {
        throw new Error('Property ' + property + ' is not configurable.');
      }
      this[property] = value;
      return true;
    },

    /**
     * Called when a recognition begins
     *
     * @private
     */
    _startHandler: function () {
      this.isRecognizing = true;
    },

    /**
     * Called if an error occurs during recognition
     *
     * @private
     */
    _errorHandler: function () {
      /*jshint expr:true */
      this.isRecognizing = false;
      this.isActive = false;
      this.onRecognitionEnded && this.onRecognitionEnded();
    },

    /**
     * Called when a recognition session ends
     *
     * @private
     */
    _endHandler: function () {
      /*jshint expr:true */
      this.isRecognizing = false;
      this.isActive = false;
      this.onRecognitionEnded && this.onRecognitionEnded();
    },

    /**
     * Called when the speech API returns a result
     *
     * @param {Event} evt The result event, implementing SpeechRecognitionEvent
     * @private
     */
    _resultHandler: function (evt) {
      if(!this.isActive){
        return;
      }
      for (var i = evt.resultIndex; i < evt.results.length; ++i) {
        var result = evt.results[i],
            primary = result[0];
        if (result.isFinal || primary.confidence >= this.requiredConfidence) {
          var transcript = primary.transcript;
          if(transcript in this.bindings){
            this.recognition.stop();
            var binding = this.bindings[transcript];
            this.input[binding.description] = 1;
          }
        }
      }
    },

    /**
     * Starts a recognition session.
     */
    start: function () {
      if(this.isActive){
        return;
      }
      if(!this.isRecognizing){
        this.recognition.lang = this.language;
        this.recognition.start();
      }
      this.isActive = true;
    },

    /**
     * Stops a recognition session.
     */
    stop: function () {
      this.isActive = false;
    },

    /**
     * Destroys all DOM event listeners
     */
    destroy: function () {
    }

  };

  return SpeechHandler;
});
