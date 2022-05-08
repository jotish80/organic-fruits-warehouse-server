const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//Middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uvblm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db('organicFruits').collection('items');

        // GET for heroku
        app.get('/hero', (req, res) => {
            res.send('this is for test purpose heroku');
        })

        //GET items
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        // GET logged user items details
        app.get('/orders', async (req, res) => {
            const email = req.query.email
            console.log(email)
            const query = { email };
            const cursor = itemsCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders)
        })
        //DELETE logged users items delete
        app.delete('/orders/:id/:email', async (req, res) => {
            const id = req.params.id;
            const email = req.params.email;
            const query = { _id: ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);
            const items = await itemsCollection.find({email});
            console.log(result)

            res.send(items);

        })

        //GET items by id
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemsCollection.findOne(query);
            console.log(item)
            res.send(item);
        });

        //POST item
        app.post('/items', async (req, res) => {
            const newItem = req.body;
            const newItemDetail = await itemsCollection.insertOne(newItem);
            res.send(newItemDetail);
            
        });


        //PATCH api for updating quantity by id
        app.patch('/updatequantity/:id', async (req, res) => {
            const id = req.params.id;
            itemsCollection.findOne({ _id: ObjectId(id) }).then(result => {
                itemsCollection.updateOne(
                    { _id: ObjectId(id) },

                    {
                        $set: {
                            quantity: Number(result.quantity) + Number(req.body.number)
                        },
                    }
                ).then(result => {
                    console.log(result)
                    res.send(result)
                })
            })
        })

        //PATCH api for deliver decreasing by id
        app.patch('/items/:id', (req, res) => {
            const id = req.params.id;
            itemsCollection.findOne({ _id: ObjectId(id) }).then(result => {
                itemsCollection.updateOne(
                    { _id: ObjectId(id) },

                    {
                        $set: {
                            quantity: result.quantity - 1
                        },
                    }
                ).then(result => {
                    res.send(result)
                })
            })

        })

        //DELETE item by id
        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('running my assignment server')
});


app.listen(port, () => {
    console.log("listening to the port", port);
})