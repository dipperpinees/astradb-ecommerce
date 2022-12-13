import asyncHandler from 'express-async-handler';
import { orderCollection, userCollection } from '../config/astradb.js';

// @desc Create new order
// @route POST /api/orders
// @access Private
const addorderitems = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } =
        req.body;
    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = {
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            isDelivered: false,
            isPaid: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            paidAt: new Date()
        };
        const createdOrder = await orderCollection.Create(order);

        res.status(201).json(createdOrder);
    }
});
// @desc get order by id
// @route GET /api/orders/:id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await orderCollection.FindByID(req.params.id);
    order.user = await userCollection.FindByID(order.user);
    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order Not found');
    }
});
// @desc update order to paid
// @route update /api/orders/:id/pay
// @access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await orderCollection.FindByID(req.params.id);
    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer.email_address,
        };
        const { _id, ...updatedOrder } = order;
        await orderCollection.update(_id, updatedOrder);
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order Not found');
    }
});

// @desc update order to delivered
// @route update /api/orders/:id/deliver
// @access Private
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await orderCollection.FindByID(req.params.id);
    if (order) {
        order.isDelivered = true;
        order.deliveredAt = new Date();
        const { _id, ...updatedOrder } = order;
        await orderCollection.update(_id, updatedOrder);
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order Not found');
    }
});
// @desc get logged in user orders
// @route GET /api/orders/myorders
// @access Private
const GetMyOrders = asyncHandler(async (req, res) => {
    const orders = await orderCollection.FindMany({ user: { $eq: req.user._id } });
    res.json(orders);
});

// @desc get orders
// @route GET /api/admin/orders
// @access Private/admin
const GetOrders = asyncHandler(async (req, res) => {
    const orders = await orderCollection.FindMany({});
    for (const order of orders) {
        order.user = await userCollection.FindByID(order.user);
    }
    res.json(orders);
});

export { addorderitems, getOrderById, updateOrderToPaid, GetMyOrders, GetOrders, updateOrderToDelivered };
