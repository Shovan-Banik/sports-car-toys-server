const express=require('express');
const cors=require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app=express();
const port=process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fus4ier.mongodb.net/?retryWrites=true&w=majority`;

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


    const toyCollection=client.db('sportsCarToy').collection('toys');

    const indexKey= {name: 1};
    const indexOption={name:"productName"};

    const result=await toyCollection.createIndex(indexKey,indexOption);


    app.get('/productSearchByName/:text',async(req,res)=>{
        const searchText=req.params.text;
        const result= await toyCollection.find({
            $and: [
                {name: {$regex: searchText, $options: "i"}}
            ]
        }).toArray();
        res.send(result);
    })


    app.get('/toys', async(req,res)=>{
        const cursor=toyCollection.find().limit(20);
        const result=await cursor.toArray();
        res.send(result);
    })

    app.get('/toys/:category',async(req,res)=>{
        const category=req.params.category;
        const query={subCategory: category};
        const cursor=toyCollection.find(query);
        const result=await cursor.toArray();
        res.send(result);

    })

    app.get('/toy/:id',async(req,res)=>{
        const id=req.params.id;
        const filter={_id: new ObjectId(id)}
        const result=await toyCollection.findOne(filter);
        res.send(result);
    })

    app.get('/myToys/:email',async(req,res)=>{
        const email=req.params.email;
        const query={sellerEmail:email};
        const cursor=toyCollection.find(query);
        const result=await cursor.toArray();
        res.send(result);
       
    })

    app.post('/addToy',async(req,res)=>{
        const data=req.body;
        const result=await toyCollection.insertOne(data);
        res.send(result);
    })

    app.patch('/myUpdatedToy/:id',async(req,res)=>{
        const id=req.params.id;
        const updatedToy=req.body;
        const filter={_id: new ObjectId(id)}
        const updatedDoc={
            $set:{
                ...updatedToy
            }
        }
        const result=await toyCollection.updateOne(filter,updatedDoc);
        res.send(result);
    })

    app.delete('/myToy/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)};
        const result= await toyCollection.deleteOne(query);
        res.send(result);
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('Sports car running');
})
app.listen(port,()=>{
    console.log(`Sports car is running on port: ${port}`);
})