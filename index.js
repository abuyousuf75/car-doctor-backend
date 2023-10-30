const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin : ['http://localhost:5173'],
  credentials : true
}));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.DB_PASS}@cluster0.7f8g7nk.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const servicesCollection = client.db('carDoctor').collection('service');
    const orderCollections = client.db('carDoctor').collection('order');
    
    /// auth related api
    app.post('/jwt' ,async (req,res) =>{
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCES_TOKEN_SECRETE,{expiresIn:'1h'})

      res
      .cookie('token', token ,{
          httpOnly: true,
          secure : false,
          

      })
      .send({sucess : true})
    })


    /// dervices related api
    app.get('/services',async(req,res) =>{
        const cursor = servicesCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

  
    app.get('/services/:id',async(req,res) =>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await servicesCollection.findOne(query);
        res.send(result)
    })


    app.get('/checkout',async(req,res) =>{
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result)
  })

    app.get('/checkout/:id', async(req,res) =>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const options = {
          projection : {title : 1, price: 1, price: 1, service_id: 1 ,img:1}
      };
      const result = await servicesCollection.findOne(query,options);
      res.send(result)
    })

    // orders fun
    app.get('/order', async(req,res) =>{
      console.log('token tok',req.cookies.token)
     let query = {};
     if(req.query?.email){
        query = {email: req.query.email}
     }
      const result = await orderCollections.find(query).toArray();
        res.send(result)
    })

    app.patch('/order/:id', async(req,res) =>{
      const updatedOrders = req.body;
      console.log(updatedOrders);
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const updateDoc = {
        $set: {
          status : updatedOrders.status
        },
      };
      const result = await orderCollections.updateOne(query,updateDoc);
      res.send(result)

    })

    // delete here
    app.delete('/order/:id' , async(req,res) =>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await orderCollections.deleteOne(query);
        res.send(result)
    })

    app.post('/order', async(req,res) =>{
        const orders = req.body;
        const {_id, ...rest} = orders;
        const result = await orderCollections.insertOne(rest);
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   
  }
}
run().catch(console.dir);







app.get('/', (req,res) =>{
    res.send('Car doctor is running...')
})

app.listen(port,() =>{
    console.log(`port is running on ${port}`)
})