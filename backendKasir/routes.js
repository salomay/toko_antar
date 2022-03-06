'use strict';

module.exports = function(app) {
    var controller = require('./controllerAdmin');
    var controllerKasir = require('./controllerKasir');
   
    app.route('/api')
        .get(controller.index);

    app.route('/api/logout')
        .post(controller.logout);

    app.route('/api/auth')
        .post(controller.auth);

    app.route('/token')
        .get(controller.token);
    
    app.route('/api/register')
        .post(controller.register);

    app.route('/api/settings')
        .get(controller.settings);

        
    app.route('/api/me')
        .get(controller.me);

    app.route('/api/analytics')
        .get(controller.analytics);

    app.route('/api/orders')
        .get(controller.orders);

    app.route('/api/popular-products')
        .get(controller.popular_products);

    app.route('/api/shops')
        .get(controller.shops);

    app.route('/api/users')
        .get(controller.users)
        
    app.route('/api/users/')
        .post(controller.userUpdate);

    app.route('/api/provinsi')
        .get(controller.provinsi);

    app.route('/api/kabupaten')
        .get(controller.kabupaten);
    
    app.route('/api/kecamatan')
        .get(controller.kecamatan);
        
    app.route('/api/kelurahan')
        .get(controller.kelurahan);

    app.route('/api/products')
        .get(controller.products);

    app.route('/api/products')
        .post(controller.products_input);

    app.route('/api/products/:id')
        .delete(controller.products_delete);

    app.route('/api/types')
        .get(controller.types)
                
    app.route('/api/categories')
        .get(controller.categories);

    app.route('/api/categories')
        .post(controller.categories_input);

    app.route('/api/categories/:id')
        .put(controller.categories_update);

    app.route('/api/categories/:id')
        .delete(controller.categories_delete);

    app.route('/api/attributes')
        .get(controller.attributes);
        
    app.route('/api/taxes')
        .get(controller.taxes);

    app.route('/api/taxes')
        .post(controller.taxes_input);

    app.route('/api/taxes/:id')
        .put(controller.taxes_update);

    app.route('/api/taxes/:id')
        .delete(controller.taxes_delete);

    app.route('/api/coupons')
        .get(controller.coupons);

    app.route('/api/coupons')
        .post(controller.coupons_input);

    app.route('/api/coupons/:id')
        .put(controller.coupons_update);

    app.route('/api/coupons/:id')
        .delete(controller.coupons_delete);


    app.route('/api/attributes')
        .post(controller.attributes_input);
        
    app.route('/api/attributes/:id')
        .put(controller.attributes_update);

    app.route('/api/attributes/:id')
        .delete(controller.attributes_delete);

    app.route('/api/types')
        .post(controller.types_input);

    app.route('/api/types/:id')
        .put(controller.types_update);

    app.route('/api/types/:id')
        .delete(controller.types_delete);

    app.route('/api/tags')
        .get(controller.tags);

    app.route('/api/tags')
        .post(controller.tags_input);

    app.route('/api/tags/:id')
        .put(controller.tags_update);

    app.route('/api/tags/:id')
        .delete(controller.tags_delete);

    app.route('/api/attachments')
        .post(controller.attachments);

    app.route('/api/images')
        .get(controller.getImages);

  
        
        
        
        
           

        

        

        
        
//================================================================

    app.route('api/loginKasir')
        .post(controllerKasir.loginKasir);

    app.route('api/viewMenuKasir')
        .post(controllerKasir.viewMenuKasir);

    app.route('api/viewNonMenuKasir')
        .post(controllerKasir.viewNonMenuKasir);

    app.route('api/viewListMenu')
        .post(controllerKasir.viewListMenu);
        
    app.route('api/getIDOrder')
        .post(controllerKasir.getIDOrder);

    app.route('api/addOrder')
        .post(controllerKasir.addOrder);

    app.route('api/countOrder')
        .post(controllerKasir.countOrder);
    
    app.route('api/getImagesKasir')
        .get(controllerKasir.getImagesKasir);

    app.route('api/viewDataPenjualan')
        .post(controllerKasir.viewDataPenjualan);
    
    app.route('api/viewListOrder')
        .post(controllerKasir.viewListOrder);

    app.route('api/updateStatusDone')
        .post(controllerKasir.updateStatusDone);


    app.route('api/viewDataPenjualanFinish')
        .post(controllerKasir.viewDataPenjualanFinish);

    app.route('api/updateAktifMenu')
        .post(controllerKasir.updateAktifMenu);

    app.route('api/viewSearchMenu')
        .post(controllerKasir.viewSearchMenu);

    app.route('api/viewMenuKasirPagination')
        .post(controllerKasir.viewMenuKasirPagination);
        
    app.route('api/viewMenuKasirPaginationOpenBill')
        .post(controllerKasir.viewMenuKasirPaginationOpenBill);
    
    app.route('api/viewNonMenuKasirPagination')
        .post(controllerKasir.viewNonMenuKasirPagination);

    app.route('api/updateStatusDoneWithDiskon')
        .post(controllerKasir.updateStatusDoneWithDiskon);
    
    app.route('api/updateStatusDoneWithBayar')
        .post(controllerKasir.updateStatusDoneWithBayar);
    
    app.route('api/selectOrder')
        .post(controllerKasir.selectOrder);

    app.route('api/addOrder2')
        .post(controllerKasir.addOrder2);
        
        
        

        

    

        

        
        
};