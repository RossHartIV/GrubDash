const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function listOrders (req, res, next) {
    res.status(200).json({data: orders});
};

function validateDeliverTo (req, res, next) {
    const { data: { deliverTo } = {} } = req.body;
    if ( deliverTo && deliverTo!=="" ) {
        return next();
    }
    next({
        status: 400,
        message: "Order must include a deliverTo",
    });
};

function validateMobileNumber (req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
    if ( mobileNumber && mobileNumber!=="" ) {
        return next();
    }
    next({
        status: 400,
        message: "Order must include a mobileNumber",
    });
};

function validateDishes (req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (dishes) {
        if (Array.isArray(dishes) && dishes.length > 0) {
            if (dishes.every(({quantity}) => quantity && quantity>0 && Number.isInteger(quantity))) {
                return next();
            }
            const index = dishes.findIndex(({quantity}) => !quantity || quantity<=0 || !(Number.isInteger(quantity)))
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            });
        }
        return next({
            status: 400,
            message: `Order must include at least one dish`,
        });
    };
    next({
        status: 400,
        message: `Order must include a dish`,
    });
};

function createOrder (req, res, next) {
    const { data: {deliverTo, mobileNumber, status, dishes}} = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({data: newOrder});
};

function validateOrder (req, res, next) {
    const { orderId } = req.params;
    if (orders.some(({id}) => id === orderId)) {
        return next();
    };
    next({
        status: 404,
        message: `Order id does not exist: ${orderId}`,
    });
};

function readOrder (req, res, next) {
    const { orderId } = req.params;
    res.status(200).json({data: orders.find(({id}) => id === orderId)});
};

function checkIdMatch (req, res, next) {
    const { orderId } = req.params;
    const { data: {id}} = req.body;
    if (id) {
        if (id === orderId) {
            return next();
        }
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
        });
    }
    next();
};

function validateStatus (req, res, next) {
    const {data: {status} = {} } = req.body;
    if (!status) {
        return next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
        });
    }
    if (status!=="") {
        if (status !== "delivered" && status !=="invalid") {
            return next();
        }
        return next({
            status: 400,
            message: `An order with invalid or delivered status cannot be changed`
        })
    }
    next({
        status: 400,
        message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
};

function updateOrder (req, res, next) {
    const { data: {deliverTo, mobileNumber, status, dishes}} = req.body;
    const { orderId } = req.params;
    const updatedOrder = {
        id: orderId,
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
    orders.map((order) => order.id===orderId ? updatedOrder:order);
    res.status(200).json({data: updatedOrder});
};

function checkPending (req, res, next) {
    const { orderId } = req.params;
    const status = orders.find(({id}) => id === orderId).status;
    if (status === 'pending') {
        return next();
    }
    next({
        status: 400,
        message: `Cannot delete an order unless it is pending`
    })
}

function deleteOrder(req, res){
    const index = orders.indexOf(res.locals.order);
    orders.splice(index, 1);
    res.sendStatus(204);
  }

module.exports = {
    listOrders,
    createOrder: [validateDeliverTo, validateMobileNumber,  validateDishes, createOrder],
    readOrder: [validateOrder, readOrder],
    updateOrder: [validateOrder, checkIdMatch, validateStatus, validateDeliverTo, validateMobileNumber,  validateDishes, updateOrder],
    deleteOrder: [validateOrder, checkPending, deleteOrder]
}