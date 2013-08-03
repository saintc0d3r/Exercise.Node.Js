/**
 * Created with IntelliJ IDEA.
 * User: wendy_sanarwanto
 * E-mail: saintc0d3r@gmail.com
 * Date: 7/1/13
 * Time: 9:26 PM
 */

var ResourceLocator = function(){
    var resources = {};

    this.locate = function(routerParams, callback){
        if (callback){
            callback(resources[routerParams.controller]);
        }
        return resources[routerParams.controller];
    };

    this.register = function(name, resource){
        if (!resources[name]){
            Object.defineProperty(resources, name, {writable: true, value:resource});
        }
    };
}

var resourceLocator = new ResourceLocator();

module.exports = resourceLocator;