'use strict';

var response = require('./res');
var connection = require('./conn');
const fs = require("fs");
var moment = require('moment');
moment().local(true);
const tgl = moment().format('DD');
const bulan = moment().format('MM');
const tahun = moment().format('YY');



const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit + 1 : 0;
  
    return { limit, offset };
  };
  


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


exports.viewMenuKasir = function(req, res) {

    if(req.body.id_outlet){

        var id_outlet = req.body.id_outlet;
        var kategori_menu = req.body.kategori_menu;   

        connection.query("SELECT a.id_menu, a.nama_menu, a.deskripsi_menu, a.kategori_menu, a.harga_menu, a.gambar_menu"+
        " FROM menu a  where a.aktif='1' and a.id_outlet=? and a.kategori_menu=? order by a.date_create desc ",
            [id_outlet,kategori_menu], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};



exports.viewMenuKasirPagination = function(req, res) {

    if(req.body.id_outlet){

        var id_outlet = req.body.id_outlet;
        var offset = getPagination(req.body.page,30).offset;
        var limit = getPagination(req.body.page,30).limit;
        var search = req.body.search;
        var kategori_menu = req.body.kategori_menu;
        
        var querySearch="";
       

        if(search !==""){
            querySearch="and a.nama_menu like '%"+ search +"%'";
        }else{
            querySearch="";
        }

        connection.query("SELECT a.id_menu, a.nama_menu, a.deskripsi_menu, a.kategori_menu, a.harga_menu, a.gambar_menu"+
        " FROM menu a  where a.aktif='1' and a.id_outlet=? and a.kategori_menu=? "+ querySearch +"  limit ?,?  ",
            [id_outlet,kategori_menu,offset,limit], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};


exports.viewMenuKasirPaginationOpenBill = function(req, res) {

    if(req.body.id_outlet){

        var id_outlet = req.body.id_outlet;
        var offset = getPagination(req.body.page,30).offset;
        var limit = getPagination(req.body.page,30).limit;
        var search = req.body.search;

        
        var querySearch="";
       

        if(search !==""){
            querySearch="and a.nama_menu like '%"+ search +"%'";
        }else{
            querySearch="";
        }

        connection.query("SELECT a.id_menu, a.nama_menu, a.deskripsi_menu, a.kategori_menu, a.harga_menu, a.gambar_menu"+
        " FROM menu a  where a.aktif='1' and a.id_outlet=?  "+ querySearch +" order by a.date_create limit ?,?  ",
            [id_outlet,offset,limit], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};




exports.viewNonMenuKasirPagination = function(req, res) {

    if(req.body.id_outlet){

        var id_outlet = req.body.id_outlet;
        var offset = getPagination(req.body.page,30).offset;
        var limit = getPagination(req.body.page,30).limit;
        var search = req.body.search;
        var kategori_menu = req.body.kategori_menu;
        
        var querySearch="";
      

        if(search !==""){
            querySearch="and a.nama_menu like '%"+ search +"%'";
        }else{
            querySearch="";
        }

        connection.query("SELECT a.id_menu, a.nama_menu, a.deskripsi_menu, a.kategori_menu, a.harga_menu, a.gambar_menu, a.aktif "+
        " FROM menu a  where a.id_outlet=? and a.kategori_menu=? "+ querySearch +" order by a.date_create limit ?,?  ",
            [id_outlet,kategori_menu,offset,limit], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};


exports.viewNonMenuKasir = function(req, res) {

    
    if(req.body.id_outlet){

        var id_outlet = req.body.id_outlet;
        var kategori_menu = req.body.kategori_menu;

        connection.query("SELECT a.id_menu, a.nama_menu, a.deskripsi_menu, a.kategori_menu, a.harga_menu, a.gambar_menu, a.aktif"+
        " FROM menu a where  a.id_outlet = ? and a.kategori_menu=? order by a.nama_menu asc ",
            [id_outlet,kategori_menu], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};



exports.viewListMenu = function(req, res) {

    
    if(req.body.listMenu.length > 0){

        var i=0;
        var gabung ="";
        var data = JSON.parse(req.body.listMenu);

        
         
        while(i < data.length ){
            
            
            if(i === data.length -1  ){
                gabung = gabung +" "+ data[i].id_menu;    
                // console.log(gabung)
            }else{
                gabung = gabung +" "+ data[i].id_menu+",";
                // console.log(gabung)
            }
            
            i++;
        }

        
        

        connection.query("SELECT a.id_menu, a.nama_menu, a.deskripsi_menu, a.kategori_menu, a.harga_menu, a.gambar_menu"+
        " FROM menu a  WHERE  a.id_menu IN ("+ gabung +") order by a.id_menu desc ",
            [gabung], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};



exports.getIDOrder = function(req, res) {

    var id_outlet = req.body.id_outlet;

    
        connection.query("SELECT id_order "+
        " FROM penjualan  WHERE id_outlet=? and  DAY(date_create)=DAY(now()) AND MONTH(date_create)=MONTH(NOW()) AND YEAR(date_create)=YEAR(NOW()) order by date_create desc limit 1 ",
            [id_outlet], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
    

      
        
};
  

exports.addOrder2 = function(req, res) {

    var id_order = req.body.id_order;
    var id_outlet = req.body.id_outlet;
    var nohp_kasir = req.body.nohp_kasir;
    var total_order = req.body.total_order;
    var detailData = req.body.detailData;
    var taxSC ="";


    if(req.body.tax){
        taxSC = " ,'"+ req.body.tax +"','"+ req.body.service_charge +"' ";
    }else{
        taxSc= " ,(SELECT b.tax from outlet b where b.id_outlet=? ),(SELECT c.service_charge from outlet c where c.id_outlet=? ) ";
    }
    
    detailData=JSON.parse(JSON.stringify(detailData));

    var query="";

    // console.log(JSON.stringify(detailData))

    var gabung = "INSERT INTO detail_penjualan (id_order,id_menu,harga_menu,id_outlet,qty,notes,status_order,date_create) values ";
    for(var i=0; i < detailData.length; i++){

        if(i == detailData.length -1){
            gabung=gabung +" ('"+ id_order +"','"+ detailData[i].id_menu +"',(SELECT harga_menu from menu where id_menu ='"+ detailData[i].id_menu +"'),'"+ id_outlet +"',  '"+  detailData[i].qty +"', '"+  detailData[i].note +"', '0', now())";
        }else{
            gabung=gabung +" ('"+ id_order +"','"+ detailData[i].id_menu +"',(SELECT harga_menu from menu where id_menu ='"+ detailData[i].id_menu +"'),'"+ id_outlet +"',  '"+  detailData[i].qty +"', '"+  detailData[i].note +"', '0', now()), ";
        }
        
    }

    
connection.beginTransaction(function(err) {
        if (err) { throw err; }

    connection.query("  INSERT INTO penjualan  "+
    " (id_order,id_outlet,nohp_kasir,total_order,status_order,date_create,tax,sc) values(?,?,?,?,0,now() "+ taxSC +" )  ",
        [id_order,id_outlet,nohp_kasir,total_order,id_outlet,id_outlet], function (error, rows, fields){
            if (err) { 
                connection.rollback(function() {
                  throw err;
                });
              }
    });


    connection.query(" "+ gabung +"  ",
        [], function (error, rows, fields){
            if (err) { 
                connection.rollback(function() {
                  throw err;
                });
              }
    });

    connection.commit(function(err, rows, field) {
        if (err) { 
          connection.rollback(function() {
            throw err;
          });
        }else{
            response.ok(rows, res);
        }
        // console.log('Transaction Completed Successfully.');
        
      });
});

    

  

}


exports.addOrder = function(req, res) {

        var id_order = "";
        var id_outlet = req.body.id_outlet;
        var nohp_kasir = req.body.nohp_kasir;
        var total_order = req.body.total_order;
        var detailData = req.body.detailData;
        var taxSC ="";
        var number ='';
    
        var gabung_id_order="";

        connection.query("SELECT DATE_FORMAT(CURDATE(),'%d%m%y') as 'tanggal_sekarang'   "+
        " ",
       [], function (error, resutlnya, fields){
           if (error) { 
                 throw error;
             }else{
               gabung_id_order=resutlnya[0].tanggal_sekarang;
             }
        });
    
connection.beginTransaction(function(err) {
    if (err) { throw err; }

    
    connection.query("SELECT id_order "+
    " FROM penjualan  WHERE id_outlet=? and  DAY(date_create)=DAY(now()) AND MONTH(date_create)=MONTH(NOW()) AND YEAR(date_create)=YEAR(NOW()) order by date_create desc limit 1 ",
        [id_outlet], function (error, rows, fields){
        if(error){
            connection.rollback(function() {
                throw error;
              });
        } else{
           
            
            if(rows.length > 0  ){
                var number_combine='';
                var num_length=0;
                number =""+rows[0].id_order+"";
                number = number.substring(0, 4);
                number = Math.abs(number);
                number= number + 1;
                num_length= number.toString().length;
                
                
                if(num_length == 1 ){
                    number_combine = '000' + number+'';
                }else if(num_length == 2 ){
                    number_combine = '00' + number+'';
                }else if(num_length == 3 ){
                    number_combine = '0' + number+'';
                }else{
                    number_combine = ''+number +'';
                }
                
                id_order= number_combine+''+gabung_id_order;
              
              
               
               
            }else{

                    id_order= '0001'+gabung_id_order;
                
            }




            if(req.body.tax){
                taxSC = " ,'"+ req.body.tax +"','"+ req.body.service_charge +"' ";
            }else{
                taxSc= " ,(SELECT b.tax from outlet b where b.id_outlet=? ),(SELECT c.service_charge from outlet c where c.id_outlet=? ) ";
            }
            
            detailData=JSON.parse(JSON.stringify(detailData));
    
            var query="";
    
            // console.log(JSON.stringify(detailData))
    
            var gabung = "INSERT INTO detail_penjualan (id_order,id_menu,harga_menu,id_outlet,qty,notes,status_order,date_create) values ";
            for(var i=0; i < detailData.length; i++){
    
                if(i == detailData.length -1){
                    gabung=gabung +" ('"+ id_order +"','"+ detailData[i].id_menu +"',(SELECT harga_menu from menu where id_menu ='"+ detailData[i].id_menu +"'),'"+ id_outlet +"',  '"+  detailData[i].qty +"', '"+  detailData[i].note +"', '0', now())";
                }else{
                    gabung=gabung +" ('"+ id_order +"','"+ detailData[i].id_menu +"',(SELECT harga_menu from menu where id_menu ='"+ detailData[i].id_menu +"'),'"+ id_outlet +"',  '"+  detailData[i].qty +"', '"+  detailData[i].note +"', '0', now()), ";
                }
                
            }
    

        
            connection.query("  INSERT INTO penjualan  "+
            " (id_order,id_outlet,nohp_kasir,total_order,status_order,date_create,tax,sc) values(?,?,?,?,0,now() "+ taxSC +" )  ",
                [id_order,id_outlet,nohp_kasir,total_order,id_outlet,id_outlet], function (error, rows, fields){
                    if (err) { 
                        connection.rollback(function() {
                          throw err;
                        });
                      }
            });
    
    
            connection.query(" "+ gabung +"  ",
                [], function (error, rows, fields){
                    if (err) { 
                        connection.rollback(function() {
                          throw err;
                        });
                      }
            });




         }


        });



        connection.commit(function(err, rows, field) {
            if (err) { 
              connection.rollback(function() {
                throw err;
              });
            }else{
                response.ok(rows, res)
            }
           
            
          });




    });



           
            


            

   





  

        

      

}


exports.countOrder = function(req, res) {

    var id_outlet = req.body.id_outlet;

    
        connection.query("SELECT count(id_outlet) as jumlah  "+
        " FROM penjualan  WHERE id_outlet=? and (status_order='0' or status_order='1') and DAY(date_create)=DAY(now()) and MONTH(date_create)=MONTH(now()) and YEAR(date_create)=YEAR(now()) ",
            [id_outlet], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
      
}


exports.getImagesKasir = function(req, res) {

    console.log(req.query.gambar)
    fs.readFile(__dirname+"/uploads/"+req.query.gambar, function(err, data) {
        if (err) throw err; // Fail if the file can't be read.
          res.writeHead(200, {'Content-Type': 'image/jpeg'});
          res.end(data); // Send the file data to the browser.
      });

  
  };


exports.viewDataPenjualan = function(req, res) {


    if(req.body.id_outlet){

        var id_outlet = req.body.id_outlet;

        connection.query("SELECT a.id_order, SUM(b.harga_menu*b.qty) AS total_order, a.status_order , a.metode_pembayaran "+
        "FROM penjualan a "+
        "JOIN detail_penjualan b ON a.id_order=b.id_order AND b.id_outlet =? " +
        "WHERE a.id_outlet=? AND (a.status_order='0'  OR a.status_order='1') AND  DAY(a.date_create)=DAY(NOW()) AND  MONTH(a.date_create)=MONTH(NOW()) AND YEAR(a.date_create)=YEAR(NOW()) GROUP BY a.id_order "+
        "order BY a.date_create asc ",
            [id_outlet,id_outlet], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};



exports.viewDataPenjualanFinish = function(req, res) {


    if(req.body.id_outlet){

        var id_outlet = req.body.id_outlet;

        connection.query("SELECT a.id_order, SUM(c.harga_menu*b.qty) as total_order  "+
        "FROM penjualan a "+
        "JOIN detail_penjualan b ON a.id_order=b.id_order AND b.id_outlet=? "+
        "JOIN menu c ON b.id_menu=c.id_menu "+
        "WHERE a.id_outlet=? AND  a.status_order='2' AND DAY(a.date_create)=DAY(NOW())  AND MONTH(a.date_create)=MONTH(NOW()) AND YEAR(a.date_create)=YEAR(NOW()) "+ 
        "GROUP BY a.id_order "+
        "order BY a.date_create asc ",
            [id_outlet,id_outlet], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};

  
exports.viewListOrder = function(req, res) {

    

    if(req.body.id_order){

        var id_order = req.body.id_order;
        var id_outlet = req.body.id_outlet;

        connection.query("SELECT c.id_menu,c.nama_menu,c.harga_menu, c.gambar_menu, b.qty, b.notes"+ 
        " FROM detail_penjualan b join menu c on b.id_menu=c.id_menu "+
        " WHERE b.id_order=? and c.id_outlet=?",
            [id_order,id_outlet], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};


exports.updateStatusDone = function(req, res) {

    if(req.body.id_order){

        var id_order = req.body.id_order;
        var id_outlet = req.body.id_outlet;
        var detailData = req.body.detailData;

        var status_order = "";
        var total_order = "";
        var metode_pembayaran = "";
     
        if(req.body.metode_pembayaran){
            metode_pembayaran=" metode_pembayaran='"+ req.body.metode_pembayaran +"' , ";
        }else{
            metode_pembayaran="";
        }

        if(req.body.total_order){
            total_order=" total_order='"+ req.body.total_order +"'  ";
        }else{
            total_order="";
        }


        if(req.body.status_order){
            status_order=" set status_order='"+ req.body.status_order +"' , ";
        }else{
            status_order=" set ";
        }

        var pembayaran = "";
        if(req.body.bayar){
            pembayaran=" , bayar='"+ req.body.bayar +"' , kembali='"+ req.body.kembali +"' ,  diskonPersen='"+ req.body.diskonPersen +"' , "+
            " diskonRupiah='"+ req.body.diskonRupiah +"'  ";   
            
        }else{
            pembayaran="";
        }

     
        connection.query(" DELETE FROM detail_penjualan WHERE id_order=? and  id_outlet=?  ",
        [id_order,id_outlet], function (error, rows, fields){
            if (error) { 
                connection.rollback(function() {
                  throw err;
                });
            }else{




                detailData=JSON.parse(JSON.stringify(detailData));

                var gabung = "INSERT INTO detail_penjualan (id_order,id_menu,harga_menu,id_outlet,qty,notes,status_order,date_create) values ";
                for(var i=0; i < detailData.length; i++){
        
                    if(i == detailData.length -1){
                        gabung=gabung +" ('"+ id_order +"','"+ detailData[i].id_menu +"',(SELECT harga_menu from menu where id_menu ='"+ detailData[i].id_menu +"'),'"+ id_outlet +"',  '"+  detailData[i].qty +"', '"+  detailData[i].note +"', '0', now())";
                    }else{
                        gabung=gabung +" ('"+ id_order +"','"+ detailData[i].id_menu +"',(SELECT harga_menu from menu where id_menu ='"+ detailData[i].id_menu +"'),'"+ id_outlet +"',  '"+  detailData[i].qty +"', '"+  detailData[i].note +"', '0', now()), ";
                    }
                    
                }
        
        
                connection.query(" "+ gabung +"  ",
                [], function (error, rows, fields){
                    if (error) { 
                        connection.rollback(function() {
                          throw err;
                        });
        
                      }else{
        
                        connection.query("UPDATE penjualan "+ status_order +" "+ metode_pembayaran +" "+ total_order +" "+ pembayaran +" "+
                        "where id_order=? and id_outlet=? ",
                           [id_order,id_outlet], function (error, rows, fields){
                           if(error){
                               console.log(error);
                               response.err(res)
                           } else{
                               response.ok(rows, res)
                           }
                       });
                
                       
                      }
                 });



            }
        });

       

      
    }
  
};


exports.updateStatusDoneWithDiskon = function(req, res) {

    if(req.body.id_order){

        var id_order = req.body.id_order;
        var id_outlet = req.body.id_outlet;
        var status_order = "";
        var diskonPersen = req.body.diskonPersen;
        var diskonRupiah = req.body.diskonRupiah;
        var total_order = "";
        var metode_pembayaran = "";

        if(req.body.metode_pembayaran){
            metode_pembayaran=" metode_pembayaran='"+ req.body.metode_pembayaran +"' , ";
        }else{
            metode_pembayaran="";
        }

        if(req.body.total_order){
            total_order=" total_order='"+ req.body.total_order +"' , ";
        }else{
            total_order="";
        }


        if(req.body.status_order){
            status_order=" set status_order='"+ req.body.status_order +"' , ";
        }else{
            status_order=" set ";
        }

        connection.query("UPDATE penjualan  "+ status_order +" "+ metode_pembayaran +" "+ total_order +" diskonPersen=?, diskonRupiah=? where id_order=? and id_outlet=? ",
            [diskonPersen,diskonRupiah,id_order,id_outlet], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};


exports.updateStatusDoneWithBayar = function(req, res) {

    if(req.body.id_order){

        var id_order = req.body.id_order;
        var id_outlet = req.body.id_outlet;

        var status_order = "";
        var total_order = "";
        var metode_pembayaran = "";
     
        if(req.body.metode_pembayaran){
            metode_pembayaran=" metode_pembayaran='"+ req.body.metode_pembayaran +"' , ";
        }else{
            metode_pembayaran="";
        }

        if(req.body.total_order){
            total_order=" total_order='"+ req.body.total_order +"'  ";
        }else{
            total_order="";
        }


        if(req.body.status_order){
            status_order=" set status_order='"+ req.body.status_order +"' , ";
        }else{
            status_order=" set ";
        }

        var pembayaran = "";
        if(req.body.bayar){
            pembayaran=" , bayar='"+ req.body.bayar +"' , kembali='"+ req.body.kembali +"' ,  diskonPersen='"+ req.body.diskonPersen +"' , "+
            " diskonRupiah='"+ req.body.diskonRupiah +"'  ";   
            
        }else{
            pembayaran="";
        }

     

        connection.query("UPDATE penjualan "+ status_order +" "+ metode_pembayaran +" "+ total_order +" "+ pembayaran +" "+
         "where id_order=? and id_outlet=? ",
            [id_order,id_outlet], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};




exports.updateAktifMenu = function(req, res) {

    

    if(req.body.id_menu){

        var id_menu = req.body.id_menu;
        var aktif = req.body.aktif;

        connection.query("UPDATE menu set aktif=? where id_menu=?  ",
            [aktif,id_menu], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};


exports.viewSearchMenu = function(req, res) {


    if(req.body.id_outlet){

        var id_outlet = req.body.id_outlet;
        var kategori_menu = req.body.kategori_menu;  
        var textSearch = req.body.textSearch;   

        connection.query("SELECT a.id_menu, a.nama_menu, a.deskripsi_menu, a.kategori_menu, a.harga_menu, a.gambar_menu"+
        " FROM menu a  where a.aktif='1' and a.id_outlet=? and a.kategori_menu=? and a.nama_menu like '%"+ textSearch +"%' order by a.date_create desc",
            [id_outlet,kategori_menu], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};


exports.viewSearchMenuNonAktif = function(req, res) {


    if(req.body.id_outlet){

        var id_outlet = req.body.id_outlet;
        var kategori_menu = req.body.kategori_menu;  
        var textSearch = req.body.textSearch;   

        connection.query("SELECT a.id_menu, a.nama_menu, a.deskripsi_menu, a.kategori_menu, a.harga_menu, a.gambar_menu"+
        " FROM menu a  where a.aktif='0' and a.id_outlet=? and a.kategori_menu=? and a.nama_menu like '%"+ textSearch +"%' order by a.nama_menu asc",
            [id_outlet,kategori_menu], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};


exports.selectOrder = function(req, res) {

    

    if(req.body.id_order){

        var id_order = req.body.id_order;
        var id_outlet = req.body.id_outlet;

        connection.query("SELECT a.tax,a.sc,a.total_order, a.diskonPersen, a.diskonRupiah, a.metode_pembayaran, a.bayar , a.kembali "+ 
        " FROM penjualan a  "+
        " WHERE a.id_order=? and a.id_outlet=?",
            [id_order,id_outlet], function (error, rows, fields){
            if(error){
                console.log(error);
                response.err(res)
            } else{
                response.ok(rows, res)
            }
        });
        
    }
  
};



exports.index = function(req, res) {

    response.ok("Hello from the Node JS RESTful side!", res)
   
};