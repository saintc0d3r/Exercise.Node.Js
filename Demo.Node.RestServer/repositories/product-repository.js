/**
 * Created with IntelliJ IDEA.
 * User: wendy_sanarwanto
 * Date: 7/15/13
 * Time: 5:28 PM
 */

var redis = require('redis');
var async = require('async');

var ProductRepository = function(){
    var keysStoreName = "product-keys";
    var keyName = "product:";

    var handleError = function(errorMessage, connection, callback){
        if (callback) {
            callback(errorMessage, null);
        }
        if (connection != null){
            connection.quit();
        }
    };

    // Pull all products from Redis Datasource
    this.getAll = function(callback){
        var connection = redis.createClient();
        var result = [];


        // Pull & iterate the sorted product keys set
        connection.zrange(keysStoreName, 0, -1, function(error, productKeys){
            if (error){
                handleError("Failed to pull keys from'"+keysStoreName+"' key store.", connection, callback);
                return;
            }
            async.each(productKeys, function(productKey, iteratorCallback ){
                connection.zscore(keysStoreName, productKey, function(error, score){
                    if (!error){
                        connection.hgetall(productKey, function(error, item){
                            if (!error){
                                if (item){
                                    result.push( { key: score, vendor: item.vendor, product: item.product  } );
                                }
                                iteratorCallback();
                            }
                            else{
                                var errorMessage = "ERROR: Unable to get '"+productKey+"' items from redis server.";
                                iteratorCallback(errorMessage);
                            }
                        });
                    }
                    else{
                        var errorMessage = "ERROR: Unable to get '"+productKey+"' item from redis server.";
                        iteratorCallback(errorMessage);
                    }
                });

            }, function(error){
                if (callback){
                    callback(error, result);
                }
                connection.quit();
            });
        });
    };

    // Pull a product by product's score
    this.get = function(productScore, callback){
        // Redirect to getAll if the productKeyScore parameter is not found
        if ( !productScore ) {
            this.getAll(params, callback);
            return;
        }

        var connection = redis.createClient();

        // Get a product by its id
        connection.zrangebyscore(keysStoreName, productScore, productScore, function(error, productKeys){
            if ( (!error) && (productKeys.length > 0)){
                connection.hgetall(productKeys[0], function(error, item){
                    if ( ( (error) || (!item)) && (callback)){
                        callback(error);
                    }
                    else if (callback) {
                        callback(null, {key: productScore, vendor: item.vendor , product: item.product } );
                    }
                    connection.quit();
                });
            }
            else{
                handleError("Unable to get record's key.", connection, callback);
            }
        });
    };

    // Update an existing product's info
    this.update = function(score, vendor, product, callback){
        var result = {isSuccess: false};

        // Create redis connection
        var connection = redis.createClient();

        // Resolve & validates the update parameters
        if ( (!vendor) && (!product) ){
            handleError("No parameters found to update the values.", connection, callback);
            return;
        }

        if ( score ){
            // Ensure that the key exists in database
            connection.zrangebyscore(keysStoreName, score, score, function(error, keys){
                if ( (!error) && (keys) && (keys.length > 0)){
                    // Call redis'es hmset command to update the product
                    connection.hmset(keys[0], {vendor: vendor, product: product}, function(status){
                        if (callback){
                            result.isSuccess = status ? status : true;
                            callback(null, result);
                        }
                        connection.quit();
                    });
                }
                else{
                    handleError("Record with key:'"+score+"' does not exist", connection, callback);
                }
            });
        }
        else{
            handleError("Key parameter is not defined.", connection, callback);
        }
    };

    // Add a new product
    this.add = function(vendor, product, callback){
        var result = {isSuccess: false}, connection;
        var updateMethod = this.update;

        // Validate vendor & product params
        if ( (vendor) && (product) ){
            // Generate product key
            connection = redis.createClient();
            connection.zcount(keysStoreName, '-inf', '+inf', function(error, keysCount){
                if (!error){
                    connection.zrange(keysStoreName, keysCount-1, keysCount, function(error, lastProductKey){
                        if ( (!error) && (result) ){
                            connection.zscore(keysStoreName, lastProductKey, function(error, lastProductKeyScore){
                                if ( (!error) && (lastProductKeyScore)){
                                    var newKeyScore = parseInt(lastProductKeyScore)+1;
                                    var newKeyName = keyName + newKeyScore;

                                    connection.zadd(keysStoreName, newKeyScore, newKeyName, function(error, zaddResult){
                                        if ( (!error) && (zaddResult) ){
                                            if (zaddResult === 1){
                                                connection.quit();
                                                updateMethod(newKeyScore, vendor, product, function(error){
                                                    if (error){
                                                        // Remove the new key from the keystore
                                                        connection.zrem(keysStoreName, newKeyName);
                                                    }
                                                    if (callback){
                                                        result.isSuccess = !error;
                                                        result.newRecordKey = newKeyScore;
                                                        callback(error, result);
                                                    }
                                                });
                                            }
                                        }
                                        else{
                                            handleError("Unable to add the new record's key into keystore.", connection, callback);
                                        }
                                    });
                                }
                                else{
                                    handleError("Unable to get last record's key score", connection, callback);
                                }
                            });
                        }
                        else{
                            handleError("Unable to get last record's key", connection, callback);
                        }
                    });
                }
                else{
                    handleError("Unable to get amount of the record's keys", connection, callback);
                }
            });
        }
    };

    // Delete an existing product
    this.delete = function(score, callback){
        var result = {isSuccess: false}, connection;

        // Validate score parameter
        if ( score ){
            connection = redis.createClient();

            connection.zrangebyscore(keysStoreName, score, score, function(error, keys){
                if ( (!error) && (keys) && (keys.length > 0)){
                    // Delete the score in the keystores
                    connection.zrem(keysStoreName, keys[0], function(error, zremStatus){
                        if (( (error) || ( zremStatus <= 0 ) ) && (callback)){
                            handleError('Unable to delete item with score: '+score+' from keys strore.', connection, callback);
                        }
                        else {
                            // Delete the record in the product hash
                            connection.hdel(keys[0], 'vendor', 'product', function(error, reply){
                                if ((error) || (reply<=0)){
                                    handleError('Unable to delete item with key: '+ keys[0] + '.', connection, callback);
                                }
                                else if (callback){
                                    result.isSuccess = true;
                                    if (callback){ callback(error, result); }
                                    connection.quit();
                                }
                            });
                        }
                    });
                }
                else{
                    handleError("Record with score:'"+score+"' does not exist", connection, callback);
                }
            });
        }
        else{
            handleError("There is no entered score's argument.", null, callback);
        }
    }
};

module.exports = new ProductRepository;