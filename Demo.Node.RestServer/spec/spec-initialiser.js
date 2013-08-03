/**
 * Created with IntelliJ IDEA.
 * User: wendy_sanarwanto
 * Date: 7/6/13
 * Time: 10:24 AM
 * Initialise test
 */

var redis = require('redis');

exports.initialiseDataInRedis = function (){
    var redisConnection = redis.createClient();
    var addProduct = function(key, vendor, product) {
        var productKey = "product:"+ key;
        var productKeys = "product-keys";
        redisConnection.zadd(productKeys, key, productKey);
        redisConnection.hmset(productKey, "vendor", vendor, "product", product);
    }
    var addProducts = function(products){
        for(var i=0; i < products.length; i++){
            addProduct(i+1, products[i].vendor, products[i].product);
        }
    }

    // -- Prepare Product data -- //
    var products = [{vendor: "Intel", product: "Core i7 4770K"},
                    {vendor: "Intel", product: "Core i5 4670K"},
                    {vendor: "Intel", product: "Core i7 3930K"},
                    {vendor: "AMD", product: "Vishera FX-8320"},
                    {vendor: "AMD", product: "Vishera FX-8350"},
                    {vendor: "AMD", product: "Trinity A10-5800K"},
                    {vendor: "AMD", product: "Richland A10-6600K"}];

    addProducts(products);

    redisConnection.quit();
}



