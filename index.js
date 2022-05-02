const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//Middle ware
app.use(cors());
app.use(express.json()); 

//user:organicUser
//pass: wr2lQw7JybEPXTHh

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uvblm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 
async function run(){
    try{
        await client.connect();
        const itemsCollection = client.db('organicFruits').collection('items');

        //GET items
        app.get('/items', async (req, res)=>{
            const query = {};
            const cursor = itemsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });


        //GET items by id
        app.get('/items/:id', async (req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const item = await itemsCollection.findOne(query);
            res.send(item);
        });

        //POST item
        app.post('/items', async (req, res) =>{
            const newItem = req.body;
            const newItemDetail = await itemsCollection.insertOne(newItem);
            res.send(newItemDetail);
        });

        //DELETE item
        app.delete('/items/:id', async (req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await itemsCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally{

    }
}

run().catch(console.dir);


app.get('/', (req,res) =>{
    res.send('running my assignment server')
});


app.listen(port, () =>{
    console.log("listening to the port", port);
})