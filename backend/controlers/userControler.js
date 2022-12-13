import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import { userCollection } from '../config/astradb.js';
import bcrypt from 'bcryptjs';

// @desc Auth user & get token
// @route POST /api/users/login
// @access Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await userCollection.FineOne({ email: { $eq: email } });
    if (user) {
        const isMatchPassword = await bcrypt.compare(password, user.password);
        if (!isMatchPassword) {
            res.status(401);
            throw new Error('Invalid email or password');
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc Register a new user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await userCollection.FineOne({ email: { $eq: email } });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await userCollection.Create({
        name,
        email,
        password: bcrypt.hashSync(password),
        isAdmin: false,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await userCollection.FindByID(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await userCollection.FindByID(req.user._id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password ? bcrypt.hashSync(req.body.password) : user.password;
        }
        const { _id, ...updatedData } = user;
        await userCollection.update(_id, updatedData);
        res.json({
            _id,
            name: updatedData.name,
            email: updatedData.email,
            isAdmin: updatedData.isAdmin,
            token: generateToken(updatedData._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc Update user user
// @route PUT /api/users/:id
// @access Private/Admin

const updateUser = asyncHandler(async (req, res) => {
    const user = await userCollection.FindByID(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = req.body.isAdmin;
        const { _id, ...updatedUser } = user;
        await userCollection.update(_id, updatedData);
        res.json({
            _id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc Get All users
// @route GET /api/users
// @access Private/admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await userCollection.FindMany({});
    res.json(users);
});
// @desc Get user by ID
// @route GET /api/users/:id
// @access Private/admin
const getUserByID = asyncHandler(async (req, res) => {
    const user = await userCollection.FindByID(req.params.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc Delete User
// @route DELETE /api/users/:id
// @access Private/admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await userCollection.FindByID(req.params.id);
    if (user) {
        await userCollection.delete(user._id);
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export { authUser, getUserProfile, registerUser, updateUserProfile, getUsers, deleteUser, getUserByID, updateUser };
