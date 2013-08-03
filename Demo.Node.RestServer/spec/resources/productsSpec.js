/**
 * Created with IntelliJ IDEA.
 * User: wendy_sanarwanto
 * Date: 7/10/13
 * Time: 5:01 AM
 */

var urlRouter = require('./../../infrastructures/url-router.js');
var resourceLocator = require('./../../infrastructures/resource-locator.js');
require('./../../resources/resources-registrar.js');
var specInitialiser = require('./../spec-initialiser.js');

describe('Products Resource', function(){
    var timeOutCall = 200;
    var resolveResource = function(requestUrl, requestMethod){
        var resolvedRequest = urlRouter.first(requestUrl, requestMethod);
        expect(resolvedRequest).not.toBe(false);
        return {resource: resourceLocator.locate(resolvedRequest), params: resolvedRequest};
    };

    specInitialiser.initialiseDataInRedis();

    it('Can returns all product items.', function(){
        var test = function(result){
            var expected = '[{"key":"1","vendor":"Intel","product":"Core i7 4770K"},' +
                            '{"key":"2","vendor":"Intel","product":"Core i5 4670K"},' +
                            '{"key":"3","vendor":"Intel","product":"Core i7 3930K"},' +
                            '{"key":"4","vendor":"AMD","product":"Vishera FX-8320"},' +
                            '{"key":"5","vendor":"AMD","product":"Vishera FX-8350"},' +
                            '{"key":"6","vendor":"AMD","product":"Trinity A10-5800K"},' +
                            '{"key":"7","vendor":"AMD","product":"Richland A10-6600K"}]';
            return JSON.stringify(result) === expected ? 'ok' : 'not equal';
        };

        runs(function(){
            // Set request URI
            var resource = resolveResource('/products/', 'GET').resource;
            resource.getAll(null, function(error, result){
                // Expect no error happens
                expect(error).toBe(null);
                // Expect that the result is returned
                expect(result.length).not.toBe(0);
                // Expect that the result is valid
                expect(test(result)).toBe('ok');
            });
        });

        waits(timeOutCall);
    });

    it('Can return a product item by a specified key', function(){
        runs(function(){
            var resolvedResource = resolveResource('/products/1', 'GET');
            resolvedResource.resource.get(resolvedResource.params, function(error, result){
                // Expect no error happens
                expect(error).toBe(null);

                // Expect that the result is correct
                expect(result.vendor).toBe('Intel');
                expect(result.product).toBe('Core i7 4770K');
            });
        });

        waits(timeOutCall);
    });


    it('Can update a product item by product key', function(){
        runs(function(){
            var resolvedResource = resolveResource('/products/7/AMD/Richland A10-6800K', 'POST');
            var params = {key: resolvedResource.params.productKeyScore,
                          vendor: resolvedResource.params.vendor,
                          product: resolvedResource.params.product};

            resolvedResource.resource. update(params, function(error, result){
                // Expect no error happens
                expect(error).toBe(null);

                // Expect the update is success
                expect(result.isSuccess).toBe(true);

                // restore the updateed value
                params.product = 'Richland A10-6600K';
                resolvedResource.resource. update(params);
            });
        });

        waits(timeOutCall);
    });

    var newRecordKey;

    it('Can add a new product item & delete an existing product item', function(){
        runs(function(){
            var resolvedResource = resolveResource('/products/AMD/Steamroller FX-9650', 'PUT');
            var params = {vendor: resolvedResource.params.vendor, product: resolvedResource.params.product};
            resolvedResource.resource.add(params, function(error, result){
                expect(error).toBe(null);
                expect(result.isSuccess).toBe(true);
                expect(result.newRecordKey).not.toBe(null);
                newRecordKey = result.newRecordKey;

                resolvedResource.resource.delete({key: newRecordKey}, function(error, reply){
                    expect(error).toBe(null);
                    expect(reply.isSuccess).toBe(true);
                });
            });
        });

        waits(timeOutCall);
    });
});
