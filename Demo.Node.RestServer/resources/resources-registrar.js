/**
 * Created with IntelliJ IDEA.
 * User: wendy_sanarwanto
 * Date: 7/4/13
 * Time: 3:50 AM
 */

var resourceLocator = require('./../infrastructures/resource-locator.js');
var router = require('./../infrastructures/url-router');

// Register Products Controller & Routers
resourceLocator.register('products', require('./products.js'));

router.get('/')
    .to('products.getAll');

router.get('/products(/)')
    .to('products.getAll');

router.get('/products/:productKeyScore')
    .to('products.get');

router.post('/products/:productKeyScore/:vendor/*product(/)')
    .to('products.update');

router.put('/products/:vendor/:product')
    .to('products.add');

router.del('/products/:productKeyScore(.:format)')
    .to('products.delete')






