require('dotenv').config()

const express = require("express")
const mysql = require('mysql')
const bodyparser = require('body-parser')
const jwt = require('jsonwebtoken')
const app = express()

app.use(express.json())

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database:'deliverydb'
})


app.get('/hello', (req,res) => {
 res.send('HEllllooo')
});

app.get('/delivers', authenticateToken, (req,res)=>{
    
    var query = "select * from livreurs where livreurs.email = ? and livreurs.password = ?";
    connection.query(query, [req.user.email, req.user.password],function(error,results){
        if (error) { throw(error) }
        res.send(JSON.stringify(results));
    })
});

app.post('/deliver/orders/orderdetail',(req, res)=>{

    var query = `select produits.*, quantite, quantite * produits.prix as prixtotal 
    from commandeproduit join produits 
    on commandeproduit.idCommade = ? and produits.idProduit = commandeproduit.idProduit`;

    
    //var query = "select * from produits where produits.nom = ?"

    connection.query(query, [req.body.idcommande], function(error,results){
        if (error) { throw(error) }
        res.send(JSON.stringify(results));
    })
});


app.get('/deliver/orders', authenticateToken, (req, res)=>{
    var query = `select commandes.idclient, commandes.dateCommande 
    from 
    livreurs join livreurcommande join commandes 
    on livreurs.email = ? and livreurs.password = ? and livreurs.idlivreur = livreurcommande.idLivreur 
    and livreurcommande.idCommande = commandes.idCommande`

    connection.query(query, [req.user.email, req.user.password],function(error,results){
        if (error) { throw(error) }
        res.send(JSON.stringify(results));
    })
});

//Authentication User and get user token
app.post('/login',function (req,res) {

    const useremail = req.body.email
    const userpassword = req.body.password
    const user = {email: useremail, password: userpassword}
    var query = "select * from livreurs where livreurs.email = ? and livreurs.password = ?";
    connection.query(query, [user.email, user.password],function(error,results){
        if (error) { throw(error) }
        
        if(results.length > 0){
           
            
            console.log("success")
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            //res.send(JSON.stringify("success"))
           res.json({accessToken: accessToken})
        }
        else {
            console.log("unauthorized")
        res.sendStatus(401)
        }
        
    })

    
});



function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

//Start server
var server = app.listen(8082,function(){
    var host = server.address().address
    var port = server.address().port
});