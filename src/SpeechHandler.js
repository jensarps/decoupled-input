define(function () {

  var SpeechHandler = function (bindings, input) {
    this.bindings = bindings;
    this.input = input;

    if (!('webkitSpeechRecognition' in window)) {
      return; // sorry.
    }

    var rec = this.recognition = new webkitSpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = this._startHandler.bind(this);
    rec.onerror = this._errorHandler.bind(this);
    rec.onend = this._endHandler.bind(this);
    rec.onresult = this._resultHandler.bind(this);
  };

  SpeechHandler.prototype = {

    recognition: null,

    isRecognizing: false,

    isActive: false,

    language: 'en-US',

    requiredConfidence: 0.5,

    onRecognitionEnded: null,

    _startHandler: function () {
      this.isRecognizing = true;
    },

    _errorHandler: function () {
      this.isRecognizing = false;
      this.isActive = false;
      this.onRecognitionEnded && this.onRecognitionEnded();
    },

    _endHandler: function () {
      this.isRecognizing = false;
      this.isActive = false;
      this.onRecognitionEnded && this.onRecognitionEnded();
    },

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

    stop: function () {
      this.isActive = false;
    },

    destroy: function () {
    }

  };

  return SpeechHandler;
});
