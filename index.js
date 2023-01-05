const express = require('express')

const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const cors = require('cors');
const { json } = require('express');

app.use(cors())

app.use(json())

app.get('/', (req, res) => {
    res.send('Server Is runing ')
})


// Mongno Db Connetion
const uri = `mongodb+srv://bookhouseadmin:tJCZsqZMAMRdvGgS@cluster0.cjesyyc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {


        // collections

        const userCollection = client.db('bookhouse').collection('users');
        const booksCollection = client.db('bookhouse').collection('books');
        const bookingCollection = client.db('bookhouse').collection('booking');

        // Get Users
        app.get('/profile', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await userCollection.findOne(query)
            res.send(result)
        })

        // Insert user
        app.post('/insertUser', async (req, res) => {
            const user = req.body;
            user.role = 1;
            const result = await userCollection.insertOne(user)
            res.send(result)
        })


        // Add Books 
        app.post('/addbook', async (req, res) => {
            const book = req.body;
            const result = await booksCollection.insertOne(book)
            res.send(result);
            // console.log(result)
        })

        // Get Books in home page 
        app.get('/books', async (req, res) => {
            const query = { status: 1 }
            const coursor = booksCollection.find(query)
            const result = await coursor.limit(4).toArray()
            res.send(result)
        })

        // Get Singe Books Data 
        app.get('/books/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await booksCollection.findOne(query);
            res.send(result)
        })

        // Get All Books in Books page 
        app.get('/allbooks', async (req, res) => {
            const page = parseInt(req.query.page);
            const perPage = parseInt(req.query.perpge);
            const query = { status: 1 }
            const coursor = booksCollection.find(query)
            const result = await coursor.skip(page * perPage).limit(perPage).toArray()
            res.send(result)
        })


        // get search books 

        app.get('/books/search', async (req, res) => {
            const searchText = req.query.searcText;
            

            // const query = {
            //    bookName:{$eq: searchText}
            //   }
            const coursor = booksCollection.find({
                bookName: { $eq: 'Bolod' }
              })
            const result = await coursor.toArray();
            console.log(result)
            res.send(result)

        })

        // Update Boosted Books
        app.post('/books/boost', async (req, res) => {
            const id = req.body;
            const query = {_id: ObjectId(id.id)};
            const upDateDoc = { $set: { boost: true } }
            const myresult =  booksCollection.updateOne(query, upDateDoc, (err, result ) => {
                if(result){
                    res.send(result)
                }
            })
        }) 

        // Boosted books 

        app.get('/boostedBooks', async (req, res) => {
            const userEmail = req.query.email;
            const query = { userEmail: userEmail, boost: true }
            const coursor = booksCollection.find(query)
            const result = await coursor.toArray();
            res.send(result)
        })

        // Delete Boook by user
        app.delete('/books/delete', async (req, res) => {
            const id = req.body;
            const query = {_id:ObjectId(id.id)}
            const deleteResult = booksCollection.deleteOne(query, (err, result) => {
                if(result) {
                    res.send(result)
                }
            })
            
        })





        // Get Books in Category search page 
        app.get('/books/:categoryName', async (req, res) => {
            const query = { category: req.params.categoryName }
            const coursor = booksCollection.find(query)
            const result = await coursor.toArray();
            res.send(result)
        })


        // Get Books in text search page
        app.get('/books/search/:text', async (req, res) => {

            const searchText = req.params.text;

            const result = booksCollection.find({ bookName: searchText })
            const final = await result.toArray()
            res.send(final)

        })


        // Get Books for Approval by admin 
        app.get('/booksApproval', async (req, res) => {
            const query = { status: 0 }
            const coursor = booksCollection.find(query);
            const result = await coursor.toArray()
            res.send(result)
        })

        // Approved by Admin 
        app.post('/booksapproved', async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: 1
                }
            }
            const result = await booksCollection.updateOne(query, updateDoc)
            res.send(result)
        })


        // Add booking data
        app.post('/addBooking', async (req, res) => {
            const bookingData = req.body;
            const result = await bookingCollection.insertOne(bookingData)
            // console.log(bookingData)
            res.send(result)
        })


        // Get Booked Books
        app.get('/bookedBooks', async (req, res) => {
            const userEmail = req.query.email;
            const query = { userEmail: userEmail }
            const coursor = bookingCollection.find(query)
            const result = await coursor.toArray();
            res.send(result)
        })

        // Get My Added Books
        app.get('/myadded', async (req, res) => {
            const userEmail = req.query.email;
            const query = { userEmail: userEmail }
            const coursor = booksCollection.find(query)
            const result = await coursor.toArray();
            res.send(result)
        })

    }

    catch {

    }

}


run().catch(error => console.log(error))


app.listen(port, () => {
    console.log('server is runing')
})