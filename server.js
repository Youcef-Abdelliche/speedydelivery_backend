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

// Endpoint: Get: les commandes en retard (+48h)
app.get('/livreur/:id/commandes/commanderetard', (req, res)=>{
    var query = `select commande.* from 
    commande where idlivreur = ? and etatCommande = "lateorder"`

    connection.query(query, [req.params.id], function (error, results) {
        if (error) { throw (error) }
        console.log("orderdetail: success")
        res.send(JSON.stringify(results));
    })
});
 
/**
 * Endpoint: Get: Les détails d'une commande en passant l'id de 
 * livreur et l'id de la commande dans les parametres du lien
 * on obtient dans results la liste des produit de la commande
 */
app.get('/livreur/:id/commandes/:idcommande', (req, res) => {
    var query = `select produit.idProduit, produit.nomProduit, commandeproduit.quantite, produit.prixProduit, produit.imageProduit 
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

/**
 * Endpoint: Get: La liste des commandes en passant l'id de livreur
 * et la date 
 * on obtient la liste des commandes de la date séléctionnée
 */
/*app.get('/livreur/:id/:date/commandes', (req, res) => {
    var query = `select commande.*
    from 
    commande 
    where idlivreur = ? and dateLivraison = ?`

    connection.query(query, [req.params.id, req.params.date], function (error, results) {
        if (error) { throw (error) }
        console.log("Success")
        res.send(JSON.stringify(results));
    })
});*/

/**
 * Endpoint: Get: La liste des commandes en passant l'id de livreur
 * on obtient la liste des commandes de la date d'aujourd'hui
 */
/*app.get('/livreur/:id/commandestoday', (req, res) => {
    var query = `select commande.*
    from 
    commande 
    where idlivreur = ? and dateLivraison = ?`
    //var date = Date()
    var date = new Date();
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();
    var today= yyyy+"-"+mm+"-"+dd
    connection.query(query, [req.params.id, today], function (error, results) {
        if (error) { throw (error) }
        console.log(yyyy+"-"+mm+"-"+dd)
        res.send(JSON.stringify(results));
    })
});*/

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

/**
 * Get la liste de commandes avec leurs infos sur le client
 * Cette endpoint est utilisé pour obtenir la liste des commandes
 * l'interface des commandes (orders)
 * il y a 2 paramètres passé dans lien: id livreur et la date
 */
app.get('/livreur/:id/commandes/:date/listes', (req,res)=>{
    var query = `select commande.idCommande, commande.etatCommande, commande.codebar, client.nomClient, client.prenomClient, adresseClient, numTelClient, emailClient, commande.prixTotal
    from 
    commande join client 
    on idlivreur = ? and dateLivraison = ? and commande.idclient = client.idClient`

    connection.query(query, [req.params.id, req.params.date], function (error, results) {
        if (error) { throw (error) }
        console.log("Liste commande: success")
        res.send(JSON.stringify(results));
    })
});

/*app.get('/livreur/:id/listescommandes', (req,res)=>{
    var query = `select commande.idCommande, client.nomClient, client.prenomClient, adresseClient, numTelClient, emailClient, commande.prixTotal
    from 
    commande join client 
    on idlivreur = ? and commande.idclient = client.idClient`

    connection.query(query, [req.params.id], function (error, results) {
        if (error) { throw (error) }
        console.log("Success")
        res.send(JSON.stringify(results));
    })
});*/


/**
 * Endpoint pour la validation d'une commande
 * En passant id livreur et id commande
 * Apres l'etat de la commande sera changée vers "Delivred"
 */
app.patch('/validationcommmande/:idcommande', (req,res)=>{
    var query = `UPDATE commande SET etatCommande = 'delivred' WHERE commande.idCommande = ?`

    connection.query(query, [req.params.idcommande], function (error, results){
        if (error) { throw (error) }
        console.log("validation commande: Success")
        res.send(JSON.stringify(results));
    })
});

//Handle Authentication User and get user id
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
            console.log("success login")
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