'use strict';

exports.ok = function(values, res) {

  // console.log(data);
    res.json(values);
    res.end();
  
};

exports.err = function( res) {
  var data = {
      'status': 404,
      'values': 'Page Not Found'
  };

  
    res.json(data);
    res.end();
  
};