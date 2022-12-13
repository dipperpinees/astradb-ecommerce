import asyncHandler from 'express-async-handler';
import { productCollection } from '../config/astradb.js';
import sortArray from 'sort-array';
// @desc Fetch all products
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
    let products = await productCollection.FindMany({});
    const Cg = req.query.Cg;
    const filter = req.query.filter;
    const from = req.query.from;
    const to = req.query.to;
    const keyword = req.query.keyword;
    if (keyword) {
        products = products.filter(({ name }) => name.toLowerCase().includes(keyword.toLowerCase()));
    }

    if (Cg) {
        res.json(products.filter(({ category }) => category.includes(Cg)));
    } else if (filter) {
        switch (filter) {
            case 'Rating':
                res.json(
                    sortArray(products, {
                        by: 'rating',
                        order: 'desc',
                    })
                );
                break;
            case 'date':
                res.json(
                    sortArray(products, {
                        by: 'createdAt',
                        order: 'desc',
                    })
                );
                break;
            case 'highprice':
                res.json(
                    sortArray(products, {
                        by: 'price',
                        order: 'asc',
                    })
                );

                break;
            case 'lowprice':
                res.json(
                    sortArray(products, {
                        by: 'price',
                        order: 'desc',
                    })
                );
                break;

            default:
                break;
        }
    } else if (from && to) {
        res.json(products.filter(({ price }) => price >= from && price <= to));
    } else {
        res.json(products);
    }
});

// @desc Fetch single  product
// @route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await productCollection.FindByID(req.params.id);
    if (product) {
        res.json(product);
    } else {
        // status it's 500 by default cuz of errHandler
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc Delete a product
// @route GET /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await productCollection.FindByID(req.params.id);
    if (product) {
        await productCollection.delete(product._id);
        res.json({ message: 'Product Removed' });
    } else {
        // status it's 500 by default cuz of errHandler
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc Create a product
// @route Post /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const product = {
        name: 'Sample name',
        price: 0,
        description: 'sample description',
        user: req.user._id,
        sizes: [],
        images: [
            'https://i.imgur.com/QN2BSdJ.jpg',
            'https://i.imgur.com/QN2BSdJ.jpg',
            'https://i.imgur.com/QN2BSdJ.jpg',
        ],
        category: [],
        countInStock: 0,
        numReviews: 0,
        reviews: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const createProduct = await productCollection.Create(product);
    res.status(201).json(createProduct);
});

// @desc Update a product
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, description, category, sizes, Images, countInStock } = req.body;
    const product = await productCollection.FindByID(req.params.id);
    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.category = category;
        product.sizes = sizes;
        product.images = Images;
        product.countInStock = countInStock;
        product.updatedAt = new Date();
        const { _id, ...updatedProduct } = product;
        await productCollection.update(_id, updatedProduct);
        res.json(updateProduct);
    } else {
        res.status(404);
        throw new Error('Product Not found');
    }
});

// @desc Create new Review
// @route PUT /api/products/:id/reviews
// @access Private
const createproductreview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await productCollection.FindByID(req.params.id);
    if (product) {
        const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
        if (alreadyReviewed) {
            res.status(404);
            throw new Error('Product Already Review');
        }
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
            updatedAt: new Date(),
            createdAt: new Date(),
        };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        product.updatedAt = new Date();
        const { _id, ...updatedProduct } = product;
        await productCollection.update(_id, updatedProduct);
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Product Not found');
    }
});

export { getProducts, getProductById, deleteProduct, createProduct, updateProduct, createproductreview };
