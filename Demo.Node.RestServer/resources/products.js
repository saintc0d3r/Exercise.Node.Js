/**
 * Created with IntelliJ IDEA.
 * User: wendy_sanarwanto
 * E-mail: saintc0d3r@gmail.com
 * Date: 7/15/13
 * Time: 8:34 PM
 */

var ProductsController = function () {
    var productRepository = require('./../repositories/product-repository.js');

    // HTTP GET - Pull all products from Redis Datasource
    this.getAll = function(params, callback){
        productRepository.getAll(callback);
    };

    // HTTP GET -  Pull a product by product's key
    this.get = function(params, callback){
        if ( (params) && (params.productKeyScore) ){
            productRepository.get(params.productKeyScore, callback);
        }
        else{
            this.getAll(params, callback);
        }
    };

    // HTTP POST - Update a product's info
    this.update = function(params, callback){
        if ( (!params) && (callback)){
            callback("No parameters found to update the values.");
            return;
        }
        productRepository.update(params.key, params.vendor, params.product, callback);
    };

    // HTTP PUT - add a new product
    this.add = function(params, callback){
        // Validate vendor & product params
        if ( (!params) && (callback) ){
            callback("No parameters found to add the new item.");
            return;
        }
        productRepository.add(params.vendor, params.product, callback);
    };

    // HTTP DELETE - delete an existing product
    this.delete = function(params, callback){
        if ( (!params) && (callback) ){
            callback("No parameters found to delete an item.");
            return;
        }
        productRepository.delete(params.key, callback);
    }
};

module.exports = new ProductsController;
