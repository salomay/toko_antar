'use strict';

var response = require('./res');
var connection = require('./conn');
const fs = require("fs");
const replaceString = require('replace-string');
var sharp = require('sharp');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
require('dotenv').config()


const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit + 1 : 0;

    return {
        limit,
        offset
    };
};



exports.auth = function (req, res) {

    const {
        email,
        password
    } = req.body;



    console.log(req.body);

    connection.query("SELECT * FROM users  WHERE email=? ",
        [email], async function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res);
            } else {


                console.log(rows[0].password);
                const match = await bcrypt.compare(password, rows[0].password);
                if (!match) return res.status(400).json({
                    msg: 'Wrong Password'
                });
                const userId = rows[0].id;
                const name = rows[0].name;
                const email = rows[0].email;

                const accessToken = jwt.sign({
                    userId,
                    name,
                    email
                }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '20s'
                });
                const rememberToken = jwt.sign({
                    userId,
                    name,
                    email
                }, process.env.REMEMBER_TOKEN_SECRET, {
                    expiresIn: '1d'
                });


                connection.query("UPDATE users set remember_token=? WHERE email=? ",
                    [rememberToken, email], async function (error, rows, fields) {
                        if (error) {
                            console.log(error);
                            response.err(res);
                        } else {

                            res.cookie('rememberToken', rememberToken, {
                                httpOnly: true,
                                maxAge: 24 * 60 * 60 * 1000
                            })

                            var data = {
                                token: accessToken,
                                permissions: ['super_admin'],
                            };

                            res.json(data);

                        }

                    });




            }
        });



};

exports.logout = function (req, res) {

    //    const rememberToken = req.cookie.rememberToken;
    //    if(!rememberToken) return res.sendStatus(204);

    //    connection.query("SELECT * FROM users  WHERE rememberToken=? ",
    //    [rememberToken], async function (error, rows, fields){
    //    if(error){
    //        console.log(error);
    //        response.err(res);
    //    } else{

    //         if(!rows[0])return res.sendStatus(204);
    //         const id = rows[0].id;

    //         connection.query("UPDATE users SET rememberToken=?  WHERE id=? ",
    //         [rememberToken,id], async function (error, rows, fields){
    //         if(error){
    //             console.log(error);
    //             response.err(res);
    //         } else{

    // res.clearCookie('rememberToken');
    return res.sendStatus(200);
    // }

    //   });


    //    }

    // });




};

exports.register = async function (req, res) {

    const {
        name,
        email,
        password
    } = req.body;

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);


    connection.query("INSERT INTO users (name,email,password,updated_at,created_at,is_active) values(?,?,?,now(),now(),'1') ",
        [name, email, hashPassword], async function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res);
            } else {



                var data = {

                    token: hashPassword,
                    permissions: ['super_admin'],
                };

                console.log(data)

                res.json(data);
            }
        });






};

exports.settings = function (req, res) {

    connection.query("SELECT * FROM settings",
        [],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {

                // const result = Object.assign({}, a, b);

                res.json(rows);
            }
        });
};


exports.token = function (req, res) {

    const refreshToken = req.cookies.refreshTokenl

    try {
        const rememberToken = req.cookies.rememberToken;
        if (!rememberToken) return res.sendStatus(401);

        connection.query("SELECT * FROM users  WHERE remember_token=? ",
            [rememberToken], async function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res);
                } else {

                    if (!rows[0]) return res.sendStatus(403);
                    jwt.verify(refreshToken, process.env.REMEMBER_TOKEN_SECRET, (err, decoded) => {
                        if (err) return res.sendStatus(403);
                        const userId = user[0].id;
                        const name = user[0].name;
                        const email = user[0].email;
                        const accessToken = jwt.sign({
                            userId,
                            name,
                            email
                        }, process.env.ACCESS_TOKEN_SECRET, {
                            expiresIn: '15s'
                        });
                        res.json({
                            accessToken
                        });
                    });

                }
            });

    } catch (error) {
        console.log(error);
    }





};

exports.me = function (req, res) {


    console.log(req.query.email);

    if (req.query.email) {

        var email = req.query.email;

        connection.query("SELECT * FROM users a LEFT JOIN user_profiles b ON a.id=b.customer_id LEFT JOIN address c ON a.id=c.customer_id  WHERE a.email=? ",
            [email],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {
                    res.json(rows);
                }
            });

    }

};

exports.analytics = function (req, res) {

    var totalRevenue = 0;
    var todaysRevenue = 0;
    var totalOrders = 0;
    var totalShops = 0;

    connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }


        connection.query("SELECT IF( SUM(a.total) IS NULL , 0, SUM(a.total)) as totalRevenue" +
            " FROM orders a " +
            " WHERE a.status=7 and a.created_at <= CURRENT_DATE()  - 30  ",
            [],
            function (error, row1, fields) {
                if (error) {
                    connection.rollback(function () {
                        throw error;
                    });
                } else {
                    totalRevenue = row1[0].totalRevenue;
                }
            });

        connection.query(" SELECT IF( SUM(a.total) IS NULL , 0, SUM(a.total))  as todaysRevenue  " +
            " FROM orders a " +
            " WHERE a.status=7 and  a.created_at = CURRENT_DATE()   ",
            [],
            function (error, row2, fields) {
                if (error) {
                    connection.rollback(function () {
                        throw error;
                    });
                } else {
                    todaysRevenue = row2[0].todaysRevenue;
                }
            });


        connection.query("SELECT IF(count(a.id) > 0 ,count(a.id) , 0) as totalOrders" +
            " FROM orders a " +
            " WHERE a.status=7 and a.created_at <= CURRENT_DATE() AND a.created_at > CURRENT_DATE() - 30 ",
            [],
            function (error, row3, fields) {
                if (error) {
                    connection.rollback(function () {
                        throw error;
                    });
                } else {
                    totalOrders = row3[0].totalOrders;
                }
            });



        connection.query(" SELECT IF(count(a.id) > 0,count(a.id),0 ) as totalShops  " +
            " FROM shops a WHERE a.is_active=1 " +
            "  ",
            [],
            function (error, row4, fields) {
                if (error) {
                    connection.rollback(function () {
                        throw error;
                    });
                } else {
                    totalShops = row4[0].totalShops;
                }
            });






        connection.commit(function (err, rows, field) {
            if (err) {
                connection.rollback(function () {
                    throw err;
                });
            } else {
                var data = {
                    // 'email':req.body.email,
                    totalRevenue: totalRevenue,
                    todaysRevenue: todaysRevenue,
                    totalOrders: totalOrders,
                    totalShops: totalShops

                };

                response.ok(data, res);

            }


        });




    });



};

exports.orders = function (req, res) {


    var search = req.query.search;
    var shop_id = req.query.shop_id;
    var page = req.query.page;
    var limit = req.query.limit;
    var orderBy = req.query.orderBy;
    var sortedBy = req.query.sortedBy;
    var orderBy = req.query.orderBy;
    var searchJoin = req.query.searchJoin;





    connection.query("SELECT * FROM orders a " +
        " JOIN order_status b ON a.id=b.id " +
        " JOIN order_product c ON a.id=c.order_id  " +
        " JOIN users d ON a.customer_id=d.id  " +
        "",
        [search, shop_id, page, limit, orderBy, sortedBy],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {
                res.json(rows);
            }
        });
};

exports.order_status = function (req, res) {


    // var search = req.query.search;
    // var shop_id = req.query.shop_id;
    // var page = req.query.page;
    // var limit = req.query.limit;
    // var orderBy = req.query.orderBy;
    // var sortedBy = req.query.sortedBy;
    // var orderBy = req.query.orderBy;
    // var searchJoin = req.query.searchJoin;



    connection.query("SELECT * FROM order_status  " +
        "",
        [],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {


                var total = rows.length;
                var count = rows.length;

                var data = {
                    data: rows,
                    // orders_count:orders_count,
                    // total:total,
                    currentPage: 1,
                    count: count,
                    lastPage: 1,
                    lastItem: count - 1,
                    perPage: "10",
                    first_page_url: "http://localhost:3000/api/users?search=&limit=10&page=1",
                    last_page_url: "http://localhost:3000/api/users?search=&limit=10&page=1",
                    next_page_url: null,
                    prev_page_url: null

                }

                res.json(data);
            }
        });
};

exports.popular_products = function (req, res) {


    connection.query(" SELECT a.id, a.name, b.id as type_id, b.name as type_name , a.price  " +
        " FROM products a " +
        " JOIN types b ON b.id = a.type_id " +
        " JOIN order_product c ON c.product_id = a.id " +
        " JOIN orders d ON d.id = c.order_id " +
        " WHERE d.status ='3'",
        [],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {
                console.log(rows.length)
                res.json(rows);
            }
        });
};


exports.shops = function (req, res) {


    var search = req.body.search;
    var searchJoin = req.body.shop_id;
    var limit = req.body.limit;
    var page = req.body.page;
    var orderBy = req.body.orderBy;
    var sortedBy = req.body.sortedBy;


    connection.query("SELECT a.* , (SELECT count(b.id) FROM orders b WHERE b.shop_id =a.id and b.status = 7) as orders_count FROM shops a ",
        [],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {



                var total = rows.length;
                var count = rows.length;
                var orders_count = rows[0].orders_count;


                var data = {
                    data: rows,
                    orders_count: orders_count,
                    total: total,
                    currentPage: page,
                    count: count,
                    lastPage: page,
                    lastItem: count - 1,
                    perPage: "10",
                    first_page_url: "http://localhost:5000/api/shops?search=&limit=10&page=1",
                    last_page_url: "http://localhost:5000/api/shops?search=&limit=10&page=1",
                    next_page_url: null,
                    prev_page_url: null

                }

                console.log(data)


                res.json(data);
            }
        });

};


exports.users = function (req, res) {



    if (req.query.id) {

        var id = req.query.id;

        connection.query("SELECT a.id, a.name, a.email," +
            " a.created_at, a.updated_at, a.is_active, a.no_telp, " +
            " b.id_kel , b.nama as nama_kelurahan, " +
            " c.id_kec , c.nama as nama_kecamatan, " +
            " d.id_kab, d.nama as nama_kabupaten, " +
            " e.id_prov, e.nama as nama_provinsi " +
            " FROM users a " +
            " JOIN kelurahan b ON a.id_kel=b.id_kel " +
            " JOIN kecamatan c ON b.id_kec=c.id_kec " +
            " JOIN kabupaten d ON c.id_kab=d.id_kab " +
            " JOIN provinsi e ON  d.id_prov=e.id_prov " +
            " where id=? " +
            "",
            [id],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {


                    res.json(rows);
                }
            });

    } else {

        var search = req.query.search;
        var searchJoin = req.query.shop_id;
        var limit = req.query.limit;
        var page = req.query.page;
        var orderBy = req.query.orderBy;
        var sortedBy = req.query.sortedBy;




        connection.query("SELECT * FROM users" +
            "",
            [],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {

                    var total = rows.length;
                    var count = rows.length;

                    var data = {
                        data: rows,
                        // orders_count:orders_count,
                        // total:total,
                        currentPage: page,
                        count: count,
                        lastPage: page,
                        lastItem: count - 1,
                        perPage: "10",
                        first_page_url: "http://localhost:3000/api/users?search=&limit=10&page=1",
                        last_page_url: "http://localhost:3000/api/users?search=&limit=10&page=1",
                        next_page_url: null,
                        prev_page_url: null

                    }



                    res.json(data);
                }
            });

    }


};

exports.userUpdate = async function (req, res) {

    console.log("masuk")


    if (req.body.id) {

        var id = req.body.id;
        var name = req.body.name;
        var email = req.body.email;
        var id_kel = req.body.id_kel;
        var no_telp = req.body.no_telp;
        var password = req.body.password;
        var query = "";

        if (req.body.password !== '') {

            const salt = await bcrypt.genSalt();
            const hashPassword = await bcrypt.hash(password, salt);

            query = "UPDATE users SET name=?, email=?, password='" + hashPassword + "' ,id_kel=?, no_telp=?";

        } else {

            query = "UPDATE users SET name=?, email=?, id_kel=?, no_telp=?";

        }


        connection.query(query +
            " where id=? " +
            "",
            [name, email, id_kel, no_telp, id],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {

                    res.json();
                }
            });






    }


};



exports.provinsi = function (req, res) {


    connection.query("SELECT * FROM provinsi order by nama ASC " +
        "",
        [],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {


                res.json(rows);
            }
        });


}

exports.kabupaten = function (req, res) {

    var id_prov = req.query.id_prov;



    if (id_prov) {

        connection.query("SELECT * FROM kabupaten WHERE id_prov=? order by id_kab asc " +
            "",
            [id_prov],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {

                    res.json(rows);
                }
            });
    }




}

exports.kecamatan = function (req, res) {



    var id_kab = req.query.id_kab;

    if (id_kab) {


        connection.query("SELECT * FROM kecamatan where id_kab=? order by id_kec asc " +
            "",
            [id_kab],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {


                    res.json(rows);
                }
            });

    }


}

exports.kelurahan = function (req, res) {



    var id_kec = req.query.id_kec;

    if (id_kec) {


        connection.query("SELECT * FROM kelurahan where id_kec=? order by id_kel asc " +
            "",
            [id_kec],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {


                    res.json(rows);
                }
            });

    }


}

exports.products = function (req, res) {


    var search = req.query.search;
    var shop_id = req.query.shop_id;
    var page = req.query.page;
    var offset = getPagination(req.query.page - 1, req.query.limit).offset;
    var limit = getPagination(req.query.page - 1, req.query.limit).limit;
    var orderBy = req.query.orderBy;
    var sortedBy = req.query.sortedBy;
    var orderBy = req.query.orderBy;
    var searchJoin = req.query.searchJoin;



    if (req.query.id) {


        connection.beginTransaction(function (err) {
            if (err) {
                throw err;
            }

            connection.query("SELECT DISTINCT a.id ,a.name, a.slug, a.description, a.in_stock, a.is_taxable, " +
                " a.price, a.sale_price, a.unit, a.status, a.image, a.type_id, a.in_stock, a.width, a.height, a.length, d.id as type_id, d.name as type_name, " +
                " d.icon as type_icon, d.image as type_image, d.slug as type_slug, c.id as categories_id, c.name as categories_name, c.slug as categories_slug " +
                " FROM products a " +
                " JOIN category_product b ON a.id=b.product_id  " +
                " JOIN categories c ON c.id=b.category_id " +
                " JOIN types d ON d.id=a.type_id " +
                " WHERE a.id = ? ",
                [req.query.id],
                function (error, rows, fields) {
                    if (error) {
                        console.log(error);
                        response.err(res);
                    } else {

                        var array_product_tag = [];

                        connection.query("SELECT a.id, a.product_id, a.tag_id, b.name " +
                            " FROM product_tag a JOIN tags b ON a.tag_id=b.id " +
                            " WHERE a.product_id = ? ",
                            [rows[0].id],
                            function (error, data_product_tag, fields) {
                                if (error) {
                                    console.log(error);
                                    response.err(res);
                                } else {




                                    for (var i = 0; i < data_product_tag.length; i++) {

                                        var data = {
                                            id: data_product_tag[i].id,
                                            name: data_product_tag[i].name,
                                        };


                                        array_product_tag.push(data)

                                    }


                                    var array_attribute_value_list = [];
                                    connection.query("SELECT b.attribute_id, b.value, b.meta, c.name " +
                                        " FROM attribute_product a " +
                                        " JOIN attribute_values b ON a.attribute_value_id=b.id " +
                                        " JOIN attributes c ON b.attribute_id=c.id " +
                                        " WHERE a.product_id=? ",
                                        [rows[0].id],
                                        function (error, data_attribute_value_list, fields) {
                                            if (error) {
                                                console.log(error);
                                                response.err(res);
                                            } else {


                                                for (var i = 0; i < data_attribute_value_list.length; i++) {

                                                    var data__ = {
                                                        "id": data_attribute_value_list[i].attribute_id,
                                                        "name": data_attribute_value_list[i].name,
                                                        "value": data_attribute_value_list[i].value
                                                    };

                                                    array_attribute_value_list.push(data__)
                                                }

                                                // console.log(array_attribute_value_list)


                                                var array_variation_options = [];

                                                connection.query("SELECT * " +
                                                    " FROM variation_options  " +
                                                    " WHERE product_id = ?  ",
                                                    [rows[0].id],
                                                    function (error, data_variation_options, fields) {
                                                        if (error) {
                                                            console.log(error);
                                                            response.err(res);
                                                        } else {



                                                            for (var i = 0; i < data_variation_options.length; i++) {

                                                                var data = {
                                                                    id: data_variation_options[i].id,
                                                                    title: data_variation_options[i].title,
                                                                    price: data_variation_options[i].price,
                                                                    sale_price: data_variation_options[i].sale_price,
                                                                    quantity: data_variation_options[i].quantity,
                                                                    is_disable: data_variation_options[i].is_disable,
                                                                    sku: data_variation_options[i].sku,
                                                                    options: JSON.parse(data_variation_options[i].options),
                                                                    product_id: rows[0].id
                                                                };

                                                                array_variation_options.push(data)
                                                            }



                                                            var array_variation = [];

                                                            connection.query("SELECT a.id, c.id as attribute_id , a.attribute_value_id, b.id as id_values, b.value, b.meta, c.name, c.slug" +
                                                                " FROM attribute_product a " +
                                                                " JOIN attribute_values b ON a.attribute_value_id = b.id " +
                                                                " JOIN attributes c ON b.attribute_id = c.id " +
                                                                " WHERE a.product_id = ? ",
                                                                [rows[0].id],
                                                                function (error, data_attribute, fields) {
                                                                    if (error) {
                                                                        console.log(error);
                                                                        response.err(res);
                                                                    } else {



                                                                        connection.query("SELECT * FROM attribute_values WHERE attribute_id = ? ",
                                                                            [rows[0].id],
                                                                            function (error, values_attribute, fields) {
                                                                                if (error) {

                                                                                    console.log(error);
                                                                                    response.err(res);

                                                                                } else {

                                                                                    var array_value = [];

                                                                                    connection.query("SELECT * FROM attribute_values ",
                                                                                        [],
                                                                                        function (error, values_attribute, fields) {
                                                                                            if (error) {

                                                                                                console.log(error);
                                                                                                response.err(res);

                                                                                            } else {

                                                                                                for (var i = 0; i < values_attribute.length; i++) {

                                                                                                    var data = {
                                                                                                        id: values_attribute[i].id,
                                                                                                        attribute_id: values_attribute[i].attribute_id,
                                                                                                        value: values_attribute[i].value,
                                                                                                        meta: values_attribute[i].meta
                                                                                                    };


                                                                                                    array_value.push(data)
                                                                                                }





                                                                                                for (var i = 0; i < data_attribute.length; i++) {

                                                                                                    var filtered = array_value.filter(a => a.attribute_id == data_attribute[i].attribute_id);

                                                                                                    var data_ = {
                                                                                                        id: data_attribute[i].attribute_value_id,
                                                                                                        attribute_id: data_attribute[i].attribute_id,
                                                                                                        value: data_attribute[i].value,
                                                                                                        meta: data_attribute[i].meta,
                                                                                                        pivot: {
                                                                                                            product_id: data_attribute[i].attribute_id,
                                                                                                            attribute_value_id: data_attribute[i].attribute_value_id,
                                                                                                        },
                                                                                                        attribute: {
                                                                                                            id: data_attribute[i].attribute_id,
                                                                                                            slug: data_attribute[i].slug,
                                                                                                            name: data_attribute[i].name,
                                                                                                            values: filtered
                                                                                                        }


                                                                                                    }


                                                                                                    array_variation.push(data_)
                                                                                                }


                                                                                                // console.log(JSON.stringify(array_variation))










                                                                                                var data = {
                                                                                                    "id": rows[0].id,
                                                                                                    "name": rows[0].name,
                                                                                                    "slug": rows[0].slug,
                                                                                                    "description": rows[0].description,
                                                                                                    "type_id": rows[0].type_id,
                                                                                                    "price": rows[0].price,
                                                                                                    "sale_price": rows[0].sale_price,
                                                                                                    "quantity": rows[0].quantity,
                                                                                                    "in_stock": rows[0].in_stock,
                                                                                                    "status": rows[0].status,
                                                                                                    "unit": rows[0].unit,
                                                                                                    "height": rows[0].height,
                                                                                                    "width": rows[0].width,
                                                                                                    "length": rows[0].length,
                                                                                                    "image": JSON.parse(rows[0].image),
                                                                                                    // "gallery": [
                                                                                                    //   {
                                                                                                    //     "id": "668",
                                                                                                    //     "original": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/667/Printed-Dress-2.png",
                                                                                                    //     "thumbnail": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/667/conversions/Printed-Dress-2-thumbnail.jpg"
                                                                                                    //   },
                                                                                                    //   {
                                                                                                    //     "id": "669",
                                                                                                    //     "original": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/668/Printed-Dress.png",
                                                                                                    //     "thumbnail": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/668/conversions/Printed-Dress-thumbnail.jpg"
                                                                                                    //   },
                                                                                                    //   {
                                                                                                    //     "id": "767",
                                                                                                    //     "original": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/766/magnetic.jpg",
                                                                                                    //     "thumbnail": "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/766/conversions/magnetic-thumbnail.jpg"
                                                                                                    //   }
                                                                                                    // ],
                                                                                                    "deleted_at": null,
                                                                                                    "created_at": rows[0].created_at,
                                                                                                    "updated_at": rows[0].update_at,
                                                                                                    "max_price": 35,
                                                                                                    "min_price": 35,
                                                                                                    // "video": null,
                                                                                                    "type": {
                                                                                                        "id": rows[0].type_id,
                                                                                                        "name": rows[0].type_name,
                                                                                                        "slug": rows[0].type_slug,
                                                                                                        "icon": rows[0].type_icon,
                                                                                                        "image": rows[0].type_images
                                                                                                    },
                                                                                                    "categories": {
                                                                                                        "id": rows[0].categories_id,
                                                                                                        "name": rows[0].categories_name,
                                                                                                    },
                                                                                                    "tags": array_product_tag,
                                                                                                    "variations": array_variation,
                                                                                                    "variation_option": array_variation_options
                                                                                                }


                                                                                                // console.log(data)
                                                                                                res.json(data);


                                                                                            }

                                                                                        });

                                                                                }

                                                                            });

                                                                    }
                                                                });

                                                        }

                                                    });

                                            }

                                        });


                                }
                            });




                    }

                });

        });



    } else {

        connection.beginTransaction(function (err) {
            if (err) {
                throw err;
            }

            var count_data = 0;


            connection.query("SELECT * " +
                " FROM products a " +
                " JOIN category_product b ON a.id=b.product_id  " +
                " JOIN categories c ON c.id=b.product_id " +
                " JOIN types d ON d.id=a.type_id " + [],
                function (error, data_rows, fields) {
                    if (error) {
                        console.log(error);
                        response.err(res);
                    } else {


                        count_data = data_rows.length;

                        //   console.log("QUERY : "+"SELECT DISTINCT a.id ,a.name, a.slug, a.description, a.in_stock, a.is_taxable, a.price, a.unit, a.status, a.image, a.type_id, d.name as type_name, "+
                        //   " d.icon as type_icon, d.slug as type_slug, c.id as categories_id, c.name as categories_name, c.slug as categories_slug "+
                        //   " FROM products a "+
                        //   " JOIN category_product b ON a.id=b.product_id  "+
                        //   " JOIN categories c ON c.id=b.category_id"+
                        //   " JOIN types d ON d.id=a.type_id "+
                        //   " GROUP BY a.id "+
                        //   " order by a.created_at desc LIMIT "+offset+","+limit+" ")

                        connection.query("SELECT DISTINCT a.id ,a.name, a.slug, a.description, a.in_stock, a.is_taxable, a.price, a.unit, a.status, a.image, a.type_id, d.name as type_name, " +
                            " d.icon as type_icon, d.slug as type_slug, c.id as categories_id, c.name as categories_name, c.slug as categories_slug " +
                            " FROM products a " +
                            " JOIN category_product b ON a.id=b.product_id  " +
                            " JOIN categories c ON c.id=b.category_id " +
                            " JOIN types d ON d.id=a.type_id " +
                            // " JOIN attachment b ON a.id=b.product_id "+

                            // " JOIN attribute_product d ON a.id=d.product_id  "+ 
                            " GROUP BY a.id " +
                            " order by a.created_at desc LIMIT " + offset + "," + limit + "",
                            [],
                            function (error, rows, fields) {
                                if (error) {
                                    console.log(error);
                                    response.err(res);
                                } else {



                                    var data_array = [];

                                    for (var i = 0; i < rows.length; i++) {

                                        var data = {
                                            id: rows[i].id,
                                            name: rows[i].name,
                                            slug: rows[i].slug,
                                            type: {
                                                id: rows[i].type_id,
                                                name: rows[i].type_name,
                                                icon: rows[i].type_icon,
                                                slug: rows[i].type_slug
                                            },
                                            categories: {
                                                id: rows[i].categories_id,
                                                name: rows[i].categories_name,
                                                slug: rows[i].categories_slug,
                                            },
                                            description: rows[i].description,
                                            in_stock: rows[i].in_stock,
                                            is_taxable: rows[i].is_taxable,
                                            image: JSON.parse(rows[i].image),
                                            status: rows[i].status,
                                            height: rows[i].height,
                                            length: rows[i].length,
                                            width: rows[i].width,
                                            price: rows[i].price,
                                            unit: rows[i].unit,
                                            created_at: rows[i].created_at,
                                            updated_at: rows[i].update_at,
                                        }

                                        data_array.push(data);
                                    }




                                    // res.json(data);


                                    connection.commit(function (err, rows, field) {
                                        if (err) {
                                            connection.rollback(function () {
                                                throw err;
                                            });
                                        } else {

                                            var total = count_data;
                                            var lastPage = count_data / limit;


                                            // var prevPage = (page + totalPages - 2) % $totalPages + 1;                

                                            var data = {
                                                data: data_array,
                                                total: total,
                                                currentPage: page,
                                                count: limit,
                                                lastPage: lastPage,
                                                lastItem: total - 1,
                                                perPage: limit,
                                                first_page_url: "http://localhost:3000/api/products?search=&limit=10&page=" + page + "",
                                                last_page_url: "http://localhost:3000/api/products?search=&limit=10&page=" + lastPage + "",
                                                next_page_url: "http://localhost:3000/api/products?search=&limit=10&page=" + (parseInt(page) + 1) + "",
                                                prev_page_url: "http://localhost:3000/api/products?search=&limit=10&page=" + (parseInt(page) - 1) + ""

                                            }


                                            res.json(data);

                                        }



                                    });

                                }
                            });
                    }

                });



        });

    }

};

exports.products_input = function (req, res) {


    var name = req.body.name;
    var description = req.body.description;
    var sku = req.body.sku;
    var unit = req.body.unit;
    var status = req.body.status;
    var type_id = req.body.type_id;
    var categories = req.body.categories;
    var quantity = req.body.quantity;
    var price = req.body.price;
    var sale_price = req.body.sale_price;
    var tags = req.body.tags;
    var width = req.body.width;
    var height = req.body.height;
    var length = req.body.length;
    var image = req.body.image;
    var images = JSON.stringify(image);




    // console.log(JSON.stringify(categories))



    connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }



        connection.query(" INSERT INTO products (name,slug,description,type_id,price,sale_price,in_stock,is_taxable,status,unit,height,width,length,image,deleted_at,created_at,updated_at) " +
            " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,now(),now(),now()) ",
            [name.charAt(0).toUpperCase() + name.slice(1), name.toLowerCase(), description, type_id, price, sale_price, quantity, 1, status, unit, height, width, length, images],
            function (error, result, fields) {
                if (error) {

                    connection.rollback(function () {
                        throw error;
                    });

                } else {


                    connection.query(" INSERT INTO category_product (product_id,category_id) VALUES (?,?) ",
                        [result.insertId, categories],
                        function (error, rows, fields) {
                            if (error) {

                                connection.rollback(function () {
                                    throw error;
                                });

                            } else {


                                var query_tag = "";

                                for (var i = 0; i < tags.length; i++) {

                                    if (i != tags.length - 1) {

                                        query_tag = query_tag + " ('" + result.insertId + "','" + tags[i] + "'), ";

                                    } else {

                                        query_tag = query_tag + " ('" + result.insertId + "','" + tags[i] + "') ";
                                    }


                                }


                                connection.query(" INSERT INTO product_tag (product_id,tag_id) VALUES " + query_tag + " ",
                                    [],
                                    function (error, rows, fields) {
                                        if (error) {

                                            connection.rollback(function () {
                                                throw error;
                                            });

                                        } else {


                                            connection.commit(function (err, rows, field) {
                                                if (err) {
                                                    connection.rollback(function () {
                                                        throw err;
                                                    });
                                                } else {

                                                    res.json(rows);

                                                }


                                            });

                                        }

                                    });

                            }


                        });


                }



            });

    });




};

exports.products_delete = function (req, res) {



    if (req.params.id) {



        connection.query(" DELETE a FROM products a " +
            " LEFT JOIN category_product b ON a.id=b.product_id " +
            " LEFT JOIN product_tag c ON a.id=c.product_id " +
            " LEFT JOIN variation_options d ON a.id=d.product_id " +
            " LEFT JOIN attribute_product e ON a.id=e.product_id " +
            " WHERE a.id=? ",
            [req.params.id],
            function (error, rows, fields) {
                if (error) {

                    connection.rollback(function () {
                        throw error;
                    });

                } else {

                    console.log(rows)

                    res.json(rows);

                }



            });



    }



};

exports.types = function (req, res) {


    var search = req.query.search;
    var orderBy = req.query.orderBy;
    var sortedBy = req.query.sortedBy;
    var orderBy = req.query.orderBy;

    var id = req.query.id;


    if (id) {

        connection.query("SELECT * FROM types WHERE id=? " +
            "",
            [id],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {

                    var data = {
                        data: rows
                    }
                    res.json(rows);

                }
            });

    } else {

        connection.query("SELECT * FROM types " +
            "",
            [],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {
                    res.json(rows);
                }
            });
    }



};

exports.categories = function (req, res) {



    if (req.query.id) {

        var id = req.query.id;

        connection.query("SELECT a.id, a.name, a.slug, a.image, a.details, a.icon, a.parent, (SELECT name FROM categories WHERE id=a.parent ) as parentName, " +
            " b.id as types_id, b.name as types_name, b.slug as types_slug, b.icon as types_icon, b.image as types_image " +
            " FROM categories a JOIN types b ON a.type_id=b.id WHERE a.id=? " +
            "",
            [id],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res);
                } else {

                    var data = [{
                        id: rows[0].id,
                        name: rows[0].name,
                        slug: rows[0].slug,
                        image: JSON.parse(rows[0].image),
                        details: rows[0].details,
                        icon: rows[0].icon,
                        type: {
                            id: rows[0].types_id,
                            name: rows[0].types_name,
                            slug: rows[0].types_slug,
                            icon: rows[0].types_icon,
                            image: rows[0].types_image
                        },
                        parent: rows[0].parent,
                        parentName: rows[0].parentName,
                    }];

                    res.json(data);
                }
            });


    } else if (req.query.id_sub_categories) {

        var id_sub_categories = req.query.id_sub_categories;

        connection.query("SELECT a.id, a.name, a.slug " +
            " FROM categories a  WHERE a.id=? " +
            "",
            [id_sub_categories],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res);
                } else {

                    var data = [];

                    if (rows.length > 0) {

                        var isi = {
                            id: rows[0].id,
                            name: rows[0].name,
                        };
                        data.push(isi);

                    }


                    res.json(data);
                }
            });

    } else if (req.query.type_id) {

        var type_id = req.query.type_id;

        connection.query("SELECT a.id, a.name, a.slug " +
            " FROM categories a  WHERE a.type_id=? " +
            "",
            [type_id],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res);
                } else {

                    var data = [];

                    if (rows.length > 0) {

                        for (var i = 0; i < rows.length; i++) {

                            var value = {
                                id: rows[i].id,
                                name: rows[i].name,

                            }

                            data.push(value)
                        }
                    }


                    res.json(data);
                }
            });

    } else if (req.query.orderBy) {

        var search = "";
        var searchJoin = req.query.searchJoin;
        var orderBy = req.query.orderBy;
        var sortedBy = req.query.sortedBy;
        var parent = req.query.parent;
        var offset = getPagination(req.query.page - 1, req.query.limit).offset;
        var limit = getPagination(req.query.page - 1, req.query.limit).limit;
        var page = req.query.page;


        search = req.query.search;

        if (search) {

            var text_search = [];
            text_search = search.split(";");


            if (text_search[1]) {


                var text_ = [];
                text_ = text_search[0].split(":");
                var text2_ = [];
                text2_ = text_search[1].split(":");

                search = " WHERE name like '%" + text_[1] + "%' and type_id = '" + text2_[1] + "' ";



            } else if (text_search[0]) {


                var text_ = [];
                text_ = text_search[0].split(":");

                search = " WHERE type_id = '" + text_[1] + "' ";

                console.log(search)

            } else {

                search = "";
            }

        } else {

            search = "";

        }




        // if(search.name){
        //     search = " WHERE name like '%"+search.name+"%' and type_id = '"+search.type_id+"' ";
        // }else{
        //     search = "";
        // }



        connection.query("SELECT  a.*, b.id as type_id, b.name as type_name " +
            " FROM categories a JOIN types b ON a.type_id=b.id " + search + " " +
            " order by a." + orderBy + " " + sortedBy + " LIMIT " + offset + "," + limit + " " +
            "",
            [],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {

                    var data_array = [];

                    for (var i = 0; i < rows.length; i++) {

                        var data_push = {
                            id: rows[i].id,
                            name: rows[i].name,
                            slug: rows[i].slug,
                            icon: rows[i].icon,
                            image: JSON.parse(rows[i].image),
                            details: rows[i].details,
                            type: {
                                id: rows[i].type_id,
                                name: rows[i].type_name
                            }
                        };


                        data_array.push(data_push)


                    }

                    var count = rows.length;

                    var data = {
                        data: data_array,
                        // total:total,
                        currentPage: page,
                        count: count,
                        lastPage: page,
                        lastItem: count - 1,
                        perPage: "10",
                        first_page_url: "http://localhost:3000/api/tags?search=&limit=10&page=1",
                        last_page_url: "http://localhost:3000/api/tags?search=&limit=10&page=1",
                        next_page_url: null,
                        prev_page_url: null

                    }


                    res.json(data);
                }
            });

    }







};

exports.categories_input = function (req, res) {


    var name = req.body.name;
    var icon = req.body.icon;
    var image = req.body.image;
    var details = req.body.details;
    var type_id = req.body.type_id;
    var parent = req.body.parent;

    var images = JSON.stringify(image);


    connection.query(" INSERT INTO categories (name,slug,icon,image,details,type_id,parent,created_at,updated_at,deleted_at) " +
        " VALUES (?,?,?,?,?,?,?,now(),now(),now()) ",
        [name.charAt(0).toUpperCase() + name.slice(1), name.toLowerCase(), icon, images, details, type_id, parent],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });


};

exports.categories_update = function (req, res) {


    var name = req.body.name;
    var icon = req.body.icon;
    var image = req.body.image;
    var details = req.body.details;
    var type_id = req.body.type_id;
    var parent = req.body.parent;

    var images = JSON.stringify(image);


    connection.query(" UPDATE categories SET name=?,slug=?,icon=?,image=?,details=?,type_id=?,parent=?,updated_at=now() WHERE id=? " +
        "  ",
        [name.charAt(0).toUpperCase() + name.slice(1), name.toLowerCase(), icon, images, details, type_id, parent, req.params.id],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });


};

exports.categories_delete = function (req, res) {



    connection.query(" DELETE FROM categories WHERE id=? " +
        "  ",
        [req.params.id],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });


};

exports.taxes = function (req, res) {


    var search = req.query.search;
    var orderBy = req.query.orderBy;
    var sortedBy = req.query.sortedBy;


    if (req.query.id) {



        connection.query("SELECT * FROM tax_classes where id=? " +
            "",
            [req.query.id],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {
                    res.json(rows);
                }
            });

    } else {


        connection.query("SELECT * FROM tax_classes " +
            "",
            [],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {
                    res.json(rows);
                }
            });
    }

};

exports.taxes_input = function (req, res) {


    var name = req.body.name;
    var rate = req.body.rate;


    connection.query(" INSERT INTO  tax_classes (name,rate,created_at,updated_at) " +
        " VALUES (?,?,now(),now()) ",
        [name, rate, ],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });

};

exports.taxes_update = function (req, res) {


    var name = req.body.name;
    var rate = req.body.rate;


    connection.query(" UPDATE tax_classes SET name=?,rate=?,updated_at=now() " +
        " WHERE id=? ",
        [name, rate, req.params.id],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });

};

exports.taxes_delete = function (req, res) {



    connection.query(" DELETE FROM tax_classes WHERE id=? " +
        "  ",
        [req.params.id],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });


};

exports.coupons = function (req, res) {


    if (req.query.id) {

        connection.query("SELECT * FROM coupons " +
            " WHERE id=? " +
            "",
            [req.query.id],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {

                    var data = [{
                        id: rows[0].id,
                        code: rows[0].code,
                        description: rows[0].description,
                        image: JSON.parse(rows[0].image),
                        type: rows[0].type,
                        amount: rows[0].amount,
                        active_from: rows[0].active_from,
                        expire_at: rows[0].expire_at,
                    }];


                    res.json(data);
                }
            });

    } else {


        var search = "";

        var page = req.query.page;
        var orderBy = req.query.orderBy;
        var sortedBy = req.query.sortedBy;
        var offset = getPagination(req.query.page - 1, req.query.limit).offset;
        var limit = getPagination(req.query.page - 1, req.query.limit).limit;


        search = req.query.search;
        var text_search = [];
        text_search = search.split(":");

        if (text_search[1]) {
            search = " WHERE code like '%" + text_search[1] + "%' ";
        } else {
            search = "";
        }



        connection.query("SELECT * FROM coupons " + search + " " +
            " order by " + orderBy + " " + sortedBy + " LIMIT " + offset + "," + limit + " " +
            "",
            [],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {


                    var data_array = [];

                    for (var i = 0; i < rows.length; i++) {

                        var data_push = {
                            id: rows[i].id,
                            code: rows[i].code,
                            description: rows[i].description,
                            image: JSON.parse(rows[i].image),
                            type: rows[i].type,
                            amount: rows[i].amount,
                            active_from: rows[i].active_from,
                            expire_at: rows[i].expire_at,
                        };


                        data_array.push(data_push)


                    }

                    var count = rows.length;

                    var data = {
                        data: data_array,
                        // total:total,
                        currentPage: page,
                        count: count,
                        lastPage: page,
                        lastItem: count - 1,
                        perPage: "10",
                        first_page_url: "http://localhost:3000/api/coupon?search=&limit=10&page=1",
                        last_page_url: "http://localhost:3000/api/coupon?search=&limit=10&page=1",
                        next_page_url: null,
                        prev_page_url: null

                    }


                    res.json(data);
                }
            });

    }


};

exports.coupons_input = function (req, res) {


    var code = req.body.code;
    var type = req.body.type;
    var image = req.body.image;
    var description = req.body.description;
    var amount = req.body.amount;
    var active_from = req.body.active_from;
    var expire_at = req.body.expire_at;

    var images = JSON.stringify(image);


    connection.query(" INSERT INTO coupons (code,description,image,type,amount,active_from,expire_at,created_at,updated_at,deleted_at) " +
        " VALUES (?,?,?,?,?,?,?,now(),now(),now()) ",
        [code, description, images, type, amount, active_from, expire_at],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });

};

exports.coupons_update = function (req, res) {


    var code = req.body.code;
    var type = req.body.type;
    var image = req.body.image;
    var description = req.body.description;
    var amount = req.body.amount;
    var active_from = req.body.active_from;
    var expire_at = req.body.expire_at;

    var images = JSON.stringify(image);


    connection.query(" UPDATE coupons SET code=?,description=?,image=?,type=?,amount=?,active_from=?,expire_at=?,updated_at=now() " +
        " WHERE id=? ",
        [code, description, images, type, amount, active_from, expire_at, req.params.id],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });

};

exports.coupons_delete = function (req, res) {



    connection.query(" DELETE FROM coupons WHERE id=? " +
        "  ",
        [req.params.id],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });


};

exports.attributes = function (req, res) {


    var search = req.query.search;
    var orderBy = req.query.orderBy;
    var sortedBy = req.query.sortedBy;
    var id = req.query.id;

    var query = "";




    if (req.query.product_id) {


        query = "SELECT c.id, c.slug, c.name, c.created_at, c.updated_at, b.id as id_ , b.attribute_id, b.value, b.meta, b.created_at as created_at_, b.updated_at as updated_at_ " +
            " FROM attribute_product a " +
            " JOIN attribute_values b ON a.attribute_value_id = b.id " +
            " JOIN attributes c ON b.attribute_id = c.id " +
            " WHERE a.product_id='" + req.query.product_id + "' ";



    } else if (search != '') {


        query = "SELECT a.id, a.slug, a.name, a.created_at, a.updated_at, b.id as id_ , b.attribute_id, b.value, b.meta, b.created_at as created_at_, b.updated_at as updated_at_ FROM attributes a JOIN attribute_values b ON a.id=b.attribute_id  ";


    } else {

        query = "SELECT a.id, a.slug, a.name, a.created_at, a.updated_at, b.id as id_ , b.attribute_id, b.value, b.meta, b.created_at as created_at_, b.updated_at as updated_at_ FROM attributes a JOIN attribute_values b ON a.id=b.attribute_id   ";

    }



    if (id) {
        query = "SELECT a.id, a.slug, a.name, a.created_at, a.updated_at, b.id as id_ , b.attribute_id, b.value, b.meta, b.created_at as created_at_, b.updated_at as updated_at_ " +
            " FROM attributes a " +
            " JOIN attribute_values b ON a.id=b.attribute_id " +
            " WHERE a.id='" + id + "' ";
    }



    connection.query(query +
        "",
        [],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {


                var id = '';
                var data_attribute = [];
                var j = 0;
                var k = 0;



                for (var i = 0; i < rows.length; i++) {



                    if (id !== rows[i].attribute_id) {


                        k = k + 1;

                        data_attribute[k - 1] = {
                            id: rows[i].id,
                            slug: rows[i].slug,
                            name: rows[i].name,
                            values: [{
                                id: rows[i].id_,
                                attribute_id: rows[i].attribute_id,
                                value: rows[i].value,
                                meta: rows[i].meta,
                                created_at: rows[i].created_at,
                                update_at: rows[i].updated_at,
                            }],
                            created_at: rows[i].created_at_,
                            update_at: rows[i].updated_at_,

                        };




                        j = 1;

                    } else {





                        data_attribute[(k - 1)]['values'][j] = {
                            id: rows[i].id_,
                            attribute_id: rows[i].attribute_id,
                            value: rows[i].value,
                            meta: rows[i].meta,
                            created_at: rows[i].created_at_,
                            update_at: rows[i].updated_at_,
                        };

                        j = j + 1;


                    }



                    id = rows[i].attribute_id;

                }



                res.json(data_attribute);

            }
        });






};

exports.attributes_input = function (req, res) {


    var name = req.body.name;
    var values = req.body.values;


    var attribute = "";



    connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }


        connection.query(" INSERT INTO attributes (name,slug,created_at,updated_at) VALUES (?,?,now(),now()) " +
            "",
            [name.charAt(0).toUpperCase() + name.slice(1), name.toLowerCase()],
            function (error, rows, fields) {
                if (error) {
                    connection.rollback(function () {
                        throw error;
                    });
                } else {

                    console.log(rows.insertId)

                    for (var i = 0; i < values.length; i++) {

                        if (i != values.length - 1) {
                            attribute = attribute + "('" + rows.insertId + "','" + values[i].value + "','" + values[i].meta + "',now(),now()),";
                        } else {
                            attribute = attribute + "('" + rows.insertId + "','" + values[i].value + "','" + values[i].meta + "',now(),now())";
                        }


                    }


                    connection.query(" INSERT INTO attribute_values (attribute_id,value,meta,created_at,updated_at) VALUES " + attribute + " " +
                        "",
                        [],
                        function (error, rows2, fields) {
                            if (error) {
                                connection.rollback(function () {
                                    throw error;
                                });
                            } else {





                                connection.commit(function (err, rows2, field) {
                                    if (err) {
                                        connection.rollback(function () {
                                            throw err;
                                        });
                                    } else {
                                        res.json(rows2);

                                    }


                                });



                            }
                        });

                }
            });



    });


};

exports.attributes_update = function (req, res) {


    var name = req.body.name;
    var values = req.body.values;



    var attribute = "";



    connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }


        connection.query(" UPDATE attributes SET name=?,slug=?,updated_at=NOW() WHERE id=? " +
            "",
            [name.charAt(0).toUpperCase() + name.slice(1), name.toLowerCase(), req.params.id],
            function (error, rows, fields) {
                if (error) {
                    connection.rollback(function () {
                        throw error;
                    });
                } else {



                    connection.query(" DELETE FROM  attribute_values WHERE attribute_id = ?" +
                        "",
                        [req.params.id],
                        function (error, rows2, fields) {
                            if (error) {
                                connection.rollback(function () {
                                    throw error;
                                });
                            } else {



                                for (var i = 0; i < values.length; i++) {

                                    if (i != values.length - 1) {
                                        attribute = attribute + "('" + req.params.id + "','" + values[i].value + "','" + values[i].meta + "',now(),now()),";
                                    } else {
                                        attribute = attribute + "('" + req.params.id + "','" + values[i].value + "','" + values[i].meta + "',now(),now())";
                                    }


                                }


                                connection.query(" INSERT INTO attribute_values (attribute_id,value,meta,created_at,updated_at) VALUES " + attribute + " " +
                                    "",
                                    [],
                                    function (error, rows3, fields) {
                                        if (error) {
                                            connection.rollback(function () {
                                                throw error;
                                            });
                                        } else {





                                            connection.commit(function (err, rows3, field) {
                                                if (err) {
                                                    connection.rollback(function () {
                                                        throw err;
                                                    });
                                                } else {
                                                    res.json(rows3);

                                                }


                                            });



                                        }
                                    });


                            }

                        });



                }
            });



    });


};

exports.attributes_delete = function (req, res) {



    connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }


        connection.query(" DELETE FROM attributes WHERE id=? " +
            "",
            [req.params.id],
            function (error, rows, fields) {
                if (error) {
                    connection.rollback(function () {
                        throw error;
                    });
                } else {



                    connection.query(" DELETE FROM  attribute_values WHERE attribute_id = ?" +
                        "",
                        [req.params.id],
                        function (error, rows2, fields) {
                            if (error) {
                                connection.rollback(function () {
                                    throw error;
                                });
                            } else {






                                connection.commit(function (err, rows2, field) {
                                    if (err) {
                                        connection.rollback(function () {
                                            throw err;
                                        });
                                    } else {
                                        res.json(rows2);

                                    }


                                });




                            }

                        });



                }
            });



    });


};

exports.types_input = function (req, res) {


    var name = req.body.name;
    var icon = req.body.icon;

    console.log(req.body)


    connection.query(" INSERT INTO types (name,slug,icon,image,created_at,updated_at) VALUES (?,?,?,NULL,now(),now()) " +
        "",
        [name.charAt(0).toUpperCase() + name.slice(1), name.toLowerCase(), icon],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });


};

exports.types_delete = function (req, res) {



    var id = req.params.id;



    connection.query(" DELETE FROM types WHERE id=? " +
        "",
        [id],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });


};

exports.types_update = function (req, res) {


    var name = req.body.name;
    var icon = req.body.icon;



    connection.query(" UPDATE types SET name=?,slug=?,icon=?,updated_at=NOW() WHERE id=? " +
        "",
        [name.charAt(0).toUpperCase() + name.slice(1), name.toLowerCase(), icon, req.params.id],
        function (error, rows, fields) {
            if (error) {
                connection.rollback(function () {
                    throw error;
                });
            } else {

                res.json(rows);

            }


        });







};

exports.tags = function (req, res) {


    if (req.query.id) {



        connection.query("SELECT a.id, a.name, a.slug, a.icon as icon_tags , " +
            " a.image, a.details, a.type_id, b.name as type_name " +
            " FROM tags a JOIN types b ON a.type_id=b.id WHERE a.id=?" +
            "",
            [req.query.id],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {

                    var data_array = [];

                    for (var i = 0; i < rows.length; i++) {

                        var data_push = {
                            id: rows[i].id,
                            name: rows[i].name,
                            slug: rows[i].slug,
                            icon: rows[i].icon_tags,
                            image: JSON.parse(rows[i].image),
                            details: rows[i].details,
                            type: {
                                id: rows[i].type_id,
                                name: rows[i].type_name,
                            }
                        };


                        data_array.push(data_push)


                    }



                    res.json(data_array);

                }
            });


    } else {

        var search = "";

        var orderBy = req.query.orderBy;
        var sortedBy = req.query.sortedBy;
        var searchJoin = req.query.searchJoin;
        var offset = getPagination(req.query.page - 1, req.query.limit).offset;
        var limit = getPagination(req.query.page - 1, req.query.limit).limit;
        var page = req.query.page;

        search = req.query.search;
        var text_search = [];
        text_search = search.split(":");
        // search =  


        if (text_search[1]) {
            search = " WHERE a.name like '%" + text_search[1] + "%' ";
        } else {
            search = "";
        }


        connection.query("SELECT a.id, a.name, a.slug, a.icon, " +
            " a.image, a.details, a.type_id, b.name as type_name " +
            " FROM tags a JOIN types b ON a.type_id=b.id " + search + " " +
            " order by a." + orderBy + " " + sortedBy + " LIMIT " + offset + "," + limit + " " +
            "",
            [],
            function (error, rows, fields) {
                if (error) {
                    console.log(error);
                    response.err(res)
                } else {

                    var data_array = [];

                    for (var i = 0; i < rows.length; i++) {

                        var data_push = {
                            id: rows[i].id,
                            name: rows[i].name,
                            slug: rows[i].slug,
                            icon: rows[i].icon,
                            image: JSON.parse(rows[i].image),
                            details: rows[i].details,
                            type: {
                                id: rows[i].type_id,
                                name: rows[i].type_name,
                            }
                        };


                        data_array.push(data_push)


                    }

                    var count = rows.length;

                    var data = {
                        data: data_array,
                        // total:total,
                        currentPage: page,
                        count: count,
                        lastPage: page,
                        lastItem: count - 1,
                        perPage: "10",
                        first_page_url: "http://localhost:3000/api/tags?search=&limit=10&page=1",
                        last_page_url: "http://localhost:3000/api/tags?search=&limit=10&page=1",
                        next_page_url: null,
                        prev_page_url: null

                    }



                    res.json(data);

                }
            });

    }


};

exports.tags_input = function (req, res) {


    var name = req.body.name;
    var icon = req.body.icon;
    var image = req.body.image;
    var details = req.body.details;
    var type_id = req.body.type_id;


    connection.query(" INSERT INTO tags (name,slug,icon,image,details,type_id,created_at,updated_at,deleted_at) " +
        " VALUES (?,?,?,?,?,?,now(),now(),now()) ",
        [name.charAt(0).toUpperCase() + name.slice(1), name.toLowerCase(), icon, JSON.stringify(image), details, type_id],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });


};


exports.tags_update = function (req, res) {

    var id = req.params.id;
    var name = req.body.name;
    var icon = req.body.icon;
    var image = req.body.image;
    var details = req.body.details;
    var type_id = req.body.type_id;


    connection.query(" UPDATE tags set name=?,slug=?,icon=?,image=?,details=?,type_id=?,updated_at=now()  " +
        " WHERE id=? ",
        [name.charAt(0).toUpperCase() + name.slice(1), name.toLowerCase(), icon, JSON.stringify(image), details, type_id, id],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });


};


exports.tags_delete = function (req, res) {

    var id = req.params.id;



    connection.query(" DELETE FROM tags   " +
        " WHERE id=? ",
        [id],
        function (error, rows, fields) {
            if (error) {

                connection.rollback(function () {
                    throw error;
                });

            } else {

                res.json(rows);

            }



        });


};


exports.attachments = function (req, res) {



    var data = [{
        thumbnail: process.env.SERVER_HOST + 'api/images/?name=' + req.files[0].filename,
        original: process.env.SERVER_HOST + 'api/images/?name=' + req.files[0].filename,
        id: Math.random()
    }];

    res.json(data);


};


exports.getImages = function (req, res) {



    fs.readFile(__dirname + "/uploads/" + req.query.name, function (err, data) {
        if (err) throw err; // Fail if the file can't be read.
        res.writeHead(200, {
            'Content-Type': 'image/jpeg'
        });
        res.end(data); // Send the file data to the browser.
    });


};


exports.laporanHarian = function (req, res) {


    var id_outlet = req.body.id_outlet;

    connection.query("SELECT DATE_FORMAT(a.date_create, '%d-%M-%Y') as tanggal, " +
        " a.id_order, a.metode_pembayaran, a.tax, a.sc, a.diskonPersen, a.diskonRupiah,  a.bayar, a.kembali,  a.total_order  as total_order " +
        "  FROM penjualan a where a.status_order='2' " +
        " and DATE(a.date_create)= DATE(NOW()) and a.id_outlet=? " +
        " GROUP BY a.id_order order by a.date_create desc",
        [id_outlet],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {
                response.ok(rows, res)
            }
        });



};


exports.reportHarian = function (req, res) {


    var id_outlet = req.body.id_outlet;
    var bulan = req.body.bulan;
    var tahun = req.body.tahun;

    connection.query("SELECT a.id_order AS No_Order, DATE_FORMAT(a.date_create,'%d-%M-%Y') AS 'Tanggal' , a.nohp_kasir AS 'No_Hp_Kasir', a.total_order as 'Total_Order', a.tax as 'Tax', a.sc as 'SC', " +
        " a.diskonPersen as 'Diskon_Persen', a.diskonRupiah as 'Diskon_Rupiah' , a.bayar as 'Bayar', a.kembali as 'Kembali', " +
        " a.metode_pembayaran AS 'Metode_Pembayaran', c.nama_menu AS 'Nama_Menu', b.harga_menu AS 'Harga_Menu', b.qty AS 'QTY', b.notes AS 'Catatan' " +
        " FROM penjualan a " +
        " JOIN detail_penjualan b ON a.id_order=b.id_order AND b.id_outlet=a.id_outlet " +
        " JOIN menu c ON b.id_menu=c.id_menu " +
        " WHERE a.id_outlet=? AND MONTH(a.date_create)=? AND YEAR(a.date_create)=? and a.status_order='2' " +
        " ORDER BY a.date_create desc ",
        [id_outlet, bulan, tahun],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {
                response.ok(rows, res)
            }
        });



};

exports.laporanBulanan = function (req, res) {


    var id_outlet = req.body.id_outlet;

    connection.query("SELECT DATE_FORMAT(a.date_create, '%m') as bulan, DATE_FORMAT(a.date_create, '%Y') as tahun, " +
        " DATE_FORMAT(a.date_create, '%M-%Y') as tanggal, " +
        " SUM(a.total_order)  as total_order " +
        " FROM penjualan a WHERE a.status_order='2' AND a.id_outlet=? " +
        " GROUP BY YEAR(a.date_create), MONTH(a.date_create) ",
        [id_outlet],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {
                response.ok(rows, res)
            }
        });



};

exports.reportBulanan = function (req, res) {


    var id_outlet = req.body.id_outlet;

    connection.query("SELECT DATE_FORMAT(a.date_create, '%m') as bulan, DATE_FORMAT(a.date_create, '%Y') as tahun, " +
        " DATE_FORMAT(a.date_create, '%M-%Y') as tanggal, " +
        " SUM(a.total_order)  as total_order " +
        " FROM penjualan a WHERE a.status_order='2' AND a.id_outlet=? " +
        " GROUP BY YEAR(a.date_create), MONTH(a.date_create) ",
        [id_outlet],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {
                response.ok(rows, res)
            }
        });



};



exports.laporanTerlaris = function (req, res) {


    var id_outlet = req.body.id_outlet;

    connection.query("SELECT c.id_menu,c.nama_menu, c.harga_menu, SUM(b.qty) as pcs " +
        "FROM penjualan a " +
        "JOIN detail_penjualan b ON a.id_order=b.id_order AND a.id_outlet=? " +
        "JOIN menu c ON b.id_menu=c.id_menu AND c.id_outlet=? " +
        "WHERE  a.status_order='2' AND  MONTH(a.date_create)=MONTH(NOW())" +
        "GROUP BY b.id_menu ORDER BY pcs desc",
        [id_outlet, id_outlet],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {
                response.ok(rows, res)
            }
        });



};



exports.laporanBulananKe = function (req, res) {


    var id_outlet = req.body.id_outlet;
    var bulan = req.body.bulan;

    connection.query(" SELECT DATE_FORMAT(date_create, '%d') as tgl,DATE_FORMAT(date_create, '%m') as bulan,DATE_FORMAT(date_create, '%Y') as tahun, DATE_FORMAT(date_create, '%d-%M-%Y') as tanggal, " +
        "SUM(total_order)  as total_order " +
        "FROM penjualan where status_order='2' and id_outlet=? AND MONTH(date_create)=? " +
        "GROUP BY YEAR(date_create), MONTH(date_create),DATE(date_create)  ",
        [id_outlet, bulan],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {
                response.ok(rows, res)
            }
        });



};


exports.laporanHarianKe = function (req, res) {


    var id_outlet = req.body.id_outlet;
    var bulan = req.body.bulan;
    var tgl = req.body.tgl;

    connection.query(" SELECT id_order , " +
        " SUM(total_order)    as total_order " +
        "FROM penjualan where status_order='2' and id_outlet=? AND MONTH(date_create)=? AND DAY(date_create)=? " +
        "GROUP BY YEAR(date_create), MONTH(date_create),DAY(date_create),id_order  ",
        [id_outlet, bulan, tgl],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {
                response.ok(rows, res)
            }
        });



};


exports.laporanNoOrder = function (req, res) {


    var id_outlet = req.body.id_outlet;
    var id_order = req.body.id_order;

    connection.query(" SELECT b.nama_menu, a.harga_menu, a.qty, a.harga_menu * a.qty as 'subtotal',  a.notes " +
        " FROM detail_penjualan a JOIN menu b ON a.id_menu=b.id_menu " +
        " where a.id_outlet=? and a.id_order=? ",
        [id_outlet, id_order],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {
                response.ok(rows, res)
            }
        });



};


exports.laporanPenjualanNoOrder = function (req, res) {


    var id_outlet = req.body.id_outlet;
    var id_order = req.body.id_order;

    connection.query(" SELECT * " +
        " FROM penjualan " +
        " where id_outlet=? and id_order=? ",
        [id_outlet, id_order],
        function (error, rows, fields) {
            if (error) {
                console.log(error);
                response.err(res)
            } else {
                response.ok(rows, res)
            }
        });



};






exports.index = function (req, res) {

    response.ok("Hello from the Node JS RESTful side!", res)

};