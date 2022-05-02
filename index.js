const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//Middle ware
app.use(cors());
app.use(express.json()); 

app.get('/', (req,res) =>{
    res.send('running my assignment server')
});


app.listen(port, () =>{
    console.log("listening to the port", port);
})