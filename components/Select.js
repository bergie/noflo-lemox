var util = require('util');

var noflo     = require('noflo');
var Port      = noflo.Port;
var Component = noflo.AsyncComponent;

var Lemox = require('lemox');

var Select = function() {
  var self = this;

  self.inPorts = {
    "in": new Port(),
    node: new Port()
  };
  self.outPorts = {
    out:   new Port(),
    error: new Port(),
    drain: new Port()
  };
  var parser;
  self.doAsync = function(xml, done) {
    parser.write(xml);
  };

  Component.call(this);

  self.inPorts.in.on('disconnect', function () {
    parser.end();
  });
  self.inPorts.node.on('data', function (data) {
    parser = new Lemox({ selector: data });
    parser.on('readable', function () {
      self.outPorts.out.send(parser.read());
    });
    parser.on('end', function () {
      self.outPorts.out.disconnect();
    });
    parser.on('drain', function () {
      self.outPorts.drain.send(true);
    });
    parser.on('error', function (err) {
      self.outPorts.error.send(err);
    });
  });
};

util.inherits(Select, Component);

exports.getComponent = function() {
  return new Select();
};
