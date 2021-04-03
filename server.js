require('dotenv').config()

const express = require("express")
const mysql = require('mysql')
const bodyparser = require('body-parser')
const jwt = require('jsonwebtoken')
const app = express()

app.use(express.json())

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'speedydeliverydb'
})



app.get('/hello', (req, res) => {
    res.send('HEllo, localhost server is working')
});


app.get('/livreur/:id/commandes/:idcommande', (req, res) => {


    var query = `select produit.*, commandeproduit.quantite 
    from 
    commande join commandeproduit join produit
    on commande.idlivreur = ? 
    and commande.idCommande = commandeproduit.idcommande 
    and commandeproduit.idcommande = ? 
    and commandeproduit.idproduit = produit.idProduit`

    //var query = "select * from produits where produits.nom = ?"

    connection.query(query, [req.params.id, req.params.idcommande], function (error, results) {
        if (error) { throw (error) }
        console.log("orderdetail: success")
        res.send(JSON.stringify(results));
    })
});


app.get('/livreur/:id/:date/commandes', (req, res) => {
    var query = `select commande.*
    from 
    commande 
    where idlivreur = ? and dateLivraison = ?`

    connection.query(query, [req.params.id, req.params.date], function (error, results) {
        if (error) { throw (error) }
        console.log("Success")
        res.send(JSON.stringify(results));
    })
});

/*app.get('/livreur/:id/commandes', (req, res) => {
    var query = `select commande.*
    from 
    commande 
    where idlivreur = ?`

    connection.query(query, [req.params.id], function (error, results) {
        if (error) { throw (error) }
        console.log("Success commandes")
        res.send(JSON.stringify(results));
    })
});*/

//Handle Authentication User and get user access token
app.post('/login', function (req, res) {

    const useremail = req.body.email
    const userpassword = req.body.password
    const userid = null
    const user = { email: useremail, password: userpassword }
    var query = "select * from livreur where livreur.emailLivreur = ? and livreur.passwordLivreur = ?";
    connection.query(query, [user.email, user.password], function (error, results) {
        if (error) { throw (error) }
        if (results.length > 0) {
            user.uid = results[0]['idLivreur']
            console.log("Success")
            //res.send(JSON.stringify("success"))
            res.json({ userid: user.uid })
        }
        else {
            console.log("Not Found")
            res.sendStatus(404)
        }

    })


});




//Start server
var server = app.listen(8082, function () {
    var host = server.address().address
    var port = server.address().port
});