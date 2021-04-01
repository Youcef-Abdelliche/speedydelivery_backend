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


app.get('/livreur/commandes/:idcommande', authenticateToken, (req, res) => {


    var query = `select produit.*, commandeproduit.quantite 
    from 
    commande join commandeproduit join produit
    on commande.idlivreur = ? 
    and commande.idCommande = commandeproduit.idcommande 
    and commandeproduit.idcommande = ? 
    and commandeproduit.idproduit = produit.idProduit`

    //var query = "select * from produits where produits.nom = ?"

    connection.query(query, [req.user.uid, req.params.idcommande], function (error, results) {
        if (error) { throw (error) }
        console.log("orderdetail: success")
        res.send(JSON.stringify(results));
    })
});


app.get('/livreur/commandes', authenticateToken, (req, res) => {
    var query = `select commande.*
    from 
    commande 
    where idlivreur = ?`

    connection.query(query, [req.user.uid], function (error, results) {
        if (error) { throw (error) }
        res.send(JSON.stringify(results));
    })
});

//Handle Authentication User and get user access token
app.post('/login', function (req, res) {

    const useremail = req.body.email
    const userpassword = req.body.password
    const userid = null
    const user = { email: useremail, password: userpassword, uid: userid }
    var query = "select * from livreur where livreur.emailLivreur = ? and livreur.passwordLivreur = ?";
    connection.query(query, [user.email, user.password], function (error, results) {
        if (error) { throw (error) }
        if (results.length > 0) {
            user.uid = results[0]['idLivreur']
            console.log("Success")
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            //res.send(JSON.stringify("success"))
            res.json({ accessToken: accessToken })
        }
        else {
            console.log("Not Found")
            res.sendStatus(404)
        }

    })


});



function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

//Start server
var server = app.listen(8082, function () {
    var host = server.address().address
    var port = server.address().port
});