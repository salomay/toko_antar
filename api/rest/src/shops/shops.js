var response = require('./../res');
var connection = require('./../conn');


exports.loginKasir = function(req, res) {

  var nohp_kasir = req.body.nohp_kasir;

      connection.query("SELECT COUNT(a.nohp_kasir) as status,a.nama_kasir , a.id_outlet, b.nama_outlet, b.alamat_outlet, b.tax, b.service_charge, b.instagram , b.nohp_owner  "+
      "FROM kasir a join outlet b on a.id_outlet=b.id_outlet and b.aktif='1' WHERE a.nohp_kasir='"+ nohp_kasir +"' GROUP BY a.nohp_kasir LIMIT 1",
          [nohp_kasir], function (error, rows, fields){
          if(error){
              console.log(error);
              response.err(res)
          } else{
              response.ok(rows, res)
          }
  });

};