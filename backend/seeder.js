import dotenv from 'dotenv';
import { connectAstraDB, orderCollection, productCollection, userCollection } from './config/astradb.js';
import product from './data/products.js';
import users from './data/users.js';

dotenv.config();

const importData = async () => {
    await connectAstraDB();
    try {
        // empty all models
        await orderCollection.Destroy();
        await productCollection.Destroy();
        await userCollection.Destroy();
        // Add data to models
        // select all users
        const createUsers = await userCollection.InsertMany(users);
        // select admin user
        const adminUser = createUsers[0]._id;
        //add admin user for each products
        const sampleProducts = product.map((product) => {
            return { ...product, user: adminUser, reviews: [], createdAt: new Date(), updatedAt: new Date() };
        });
        //add all products data to the model
        await productCollection.InsertMany(sampleProducts);
        console.log('Data Imported');
    } catch (error) {
        process.exit(1);
    }
};
const destroyData = async () => {
    await connectAstraDB();
    try {
        // empty all models
        await orderCollection.Destroy();
        await productCollection.Destroy();
        await userCollection.Destroy();

        console.log(`Data Destroyed !`.red.inverse);
    } catch (error) {
        console.log(`${error}`.red.inverse);
        process.exit(1);
    }
};

//node backend/seeder -d
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
