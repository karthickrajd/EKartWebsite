const express = require('express');
const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');

const router = express.Router();

module.exports = (db) => {
  router.post('/signup', authController.signup(db));
  router.post('/login', authController.login(db));
  router.get('/users', authController.getUsers(db));

  router.post('/orders', orderController.saveOrder(db));
  router.get('/orders', orderController.getAllOrders(db));
  router.get('/my-orders', orderController.getMyOrders(db));

  return router;
};
