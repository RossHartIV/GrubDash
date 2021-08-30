const router = require("express").Router();
const conrtoller = require('./orders.controller');
const methodNotAllowed = require('../errors/methodNotAllowed');

// TODO: Implement the /orders routes needed to make the tests pass
router
    .route('/')
    .get(conrtoller.listOrders)
    .post(conrtoller.createOrder)
    .all(methodNotAllowed);

router
    .route('/:orderId')
    .get(conrtoller.readOrder)
    .put(conrtoller.updateOrder)
    .delete(conrtoller.deleteOrder)
    .all(methodNotAllowed);

module.exports = router;
