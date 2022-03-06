'use strict';

exports.ok = function(values, res) {
  var data = {
      'status': 200,
      'values': values
  };

  // console.log(data);
    res.json(data);
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