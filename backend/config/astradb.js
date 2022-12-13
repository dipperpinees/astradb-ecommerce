import { createClient } from '@astrajs/collections';
let astraClient;
let userCollection, productCollection, orderCollection;
const findOne = async function (query) {
    const { data } = await this.find(query);
    if (!Object.keys(data).length) return null;
    return { ...data[Object.keys(data)[0]], _id: Object.keys(data)[0] };
};
const findMany = async function (query) {
    const { data } = await this.find(query);
    return Object.keys(data).map((key) => ({ ...data[key], _id: key }));
};
const create = async function (data) {
    const { documentId } = await this.create(data);
    return { ...data, _id: documentId };
};
const findByID = async function (id) {
    const data = await this.get(id);
    return { ...data, _id: id };
};
const insertMany = async function (data) {
    const result = await Promise.all(data.map((item) => this.Create(item)));
    return result;
};
const destroy = async function () {
    const { data } = await this.find({});
    await Promise.all(Object.keys(data).map((key) => this.delete(key)));
};
async function connectAstraDB() {
    astraClient = await createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
    });
    userCollection = astraClient.namespace(process.env.ASTRA_DB_KEYSPACE).collection('user');
    productCollection = astraClient.namespace(process.env.ASTRA_DB_KEYSPACE).collection('products');
    orderCollection = astraClient.namespace(process.env.ASTRA_DB_KEYSPACE).collection('orders');

    //add method
    [userCollection, productCollection, orderCollection].forEach((collection) => {
        collection.FineOne = findOne;
        collection.Create = create;
        collection.FindByID = findByID;
        collection.InsertMany = insertMany;
        collection.FindMany = findMany;
        collection.Destroy = destroy;
    });
    // const data = await userCollection.find({})
    // console.log('dulieu', data)
    // orderCollection.Destroy();
}

export { connectAstraDB, userCollection, productCollection, orderCollection };
