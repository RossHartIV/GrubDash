const { read } = require("fs");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function listDishes (req, res, next) {
    res.status(200).json({data: dishes})
}

function validateName (req, res, next) {
    const { data: { name } = {} } = req.body;
    if ( name && name!=="" ) {
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a name",
    });
};

function validateDescription (req, res, next) {
    const { data: { description } = {} } = req.body;
    if ( description && description!=="" ) {
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a description",
    });
};

function validatePrice (req, res, next) {
    const { data: { price } = {} } = req.body;
    if ( price ) {
        if ( price>0 && Number.isInteger(price) ) {
            return next();
        }
        return next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0",
        });
    }
    next({
        status: 400,
        message: "Dish must include a price",
    });
};

function validateImageURL (req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if ( image_url && image_url!=="" ) {
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a image_url",
    });
};

function createDish (req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({data: newDish})
}

function validateDishId (req, res, next) {
    const { dishId } = req.params;
    if (dishes.some((dish) => dish.id === dishId)) {
        return next();
    }
    next({
        status: 404,
        message: `Dish id does not exist: ${dishId}`,
    });
}

function readDish (req, res, next) {
    const { dishId } = req.params;
    res.status(200).json({data: dishes.find((dish) => dish.id === dishId)});
}

function checkDishIdMatch (req, res, next) {
    const { dishId } = req.params;
    const { data: { id } = {} } = req.body;
    if (id) {
        if (dishId === id) {
            return next()
        }
        return next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
        });
    };
    next();
}

function updateDish (req, res, next) {
    const { dishId } = req.params;
    const { data: { name, description, price, image_url } = {} } = req.body;
    const updatedDish = {
        id: dishId,
        name,
        description,
        price,
        image_url,
    };
    dishes.map((dish) => dish.id === dishId ? updatedDish:dish);
    res.status(200).json({data: updatedDish});
}



module.exports = {
    listDishes,
    create: [validateName, validateDescription, validatePrice, validateImageURL, createDish],
    readDish: [validateDishId, readDish],
    updateDish: [validateDishId, checkDishIdMatch, validateName, validateDescription, validatePrice, validateImageURL, updateDish],
}