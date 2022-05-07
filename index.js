const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
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

        //AUTH TOKEN

        // app.post('/login', async (req, res) =>{
        //     const user = req.body;
        //     const token =  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        //         expiresIn: '10d'
        //     });
        //     res.send({token});
        // })


        //GET items
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        // GET logged user details
        app.get('/items/:email', async (req, res) => {
            const email = req.params.email;
            try {
                const items = await itemsCollection.find({ email })
                res.send(items)
            }
            catch (err) {
                console.log(err)
                res.send(err)
            }
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


        //PUT update quantity

        app.put('/items/:id', async (req, res) => {
            const id = req.params.id;
            const newQuantity = req.body.number;
            const query = { _id: ObjectId(id) };
            try {
                const item = await itemsCollection.findOne(query)

                const updatedQuantity = await itemsCollection.updateOne(
                    query,
                    {
                        $set: { 'quantity': Number(item.quantity) + Number(newQuantity) }
                    },
                    { upsert: true });

                const updatedItem = await itemsCollection.findOne(query)

                res.send(updatedItem);
            }
            catch (err) {
                console.log(err)
                res.set(err)
            }
        })

        

        //PATCH api for updating quantity
        app.patch('/updatequantity/:id', async (req, res)=>{
            console.log("hello ",req.body.number);
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

        app.patch('/items/:id', (req, res) => {
            console.log(req.body)
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
                    console.log(result)
                    res.send(result)
                })
            })

        })

        //DELETE item
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