const express = require('express')
const router = express.Router()
const articles = require('../data/articles.js')
const mysql = require('mysql');
const bcrypt = require('bcrypt');


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Votre mot de passe",
  database: "le nom de votre base de données"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL !");
})

class Panier {
  constructor () {
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.articles = []
  }
}


router.post("/login", async (req, res) =>{

  const password = req.body.password;
  const email = req.body.email;

  if(typeof email !== 'string' || typeof password !== 'string' || email === '' || password === ''){
    res.status(400).json({message : 'Vérifier les informations que vous avez saisies.'});
    return
  }
  let promiseQuery = new Promise(async (resolve, reject ) =>{
    console.log(email);
    var emailConnexion = [[email]];
    db.query('SELECT * FROM users WHERE email = ? ', [emailConnexion], async (err, res) => {
      console.log(res);
      if (err) reject(err);
      else{
          if(res.length <= 0){
            reject()
          }else{
            let cryptPassword = res[0].password;
            let samePAssword = await bcrypt.compare(password, cryptPassword);
            if(samePAssword){
              
              resolve({
                id : res[0].id_user,
                email: res[0].email
              });
            }else{
              reject();
            }
          } 
      }
    })
  })

    try{
      let requete = await promiseQuery;
      req.session.userId = requete.id;
      let response = {}
      response.data = requete;
       res.json(response)
    }catch (err){
      console.log(err)
      res.status(401).json({
        message : err
      })
    }
  })

router.use((req, res, next) => {
  
  if (typeof req.session.panier === 'undefined') {
    req.session.panier = new Panier()
  }
  next()
})


router.get('/panier', (req, res) => {
  res.json(req.session.panier);
})


router.post('/panier', (req, res) => {
  const articleID = articles.find(a => a.id === parseInt(req.body.id) )
  console.log(articleID)
  if(!articleID){
    res.status(400).json({ message: 'article ' + req.body.id + ' does not exist' })
    return
  }
  if(parseInt(req.quantity) <= 0){
    res.status(400).json({ message: 'Quantité non valide' })
    return
  }
  const arcticteAlreadyInBasket = req.session.panier.articles.find(a => a.id === parseInt(req.body.id))
  if(arcticteAlreadyInBasket){
    res.status(400).json({ message: 'Article déjà dans le panier... '})
    return
  }
  req.session.panier.articles.push({
    id: parseInt(req.body.id),
    quantity: req.body.quantity
  })
  res.json(req.session.panier)
})


router.post('/panier/pay', (req, res) => {
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  req.session.destroy()
  res.status(200).json({message: 'Merci ' + firstName + ' ' + lastName + ' pour votre achat !'})
})


router.put('/panier/:articleId', (req, res) => {
  const article = req.session.panier.articles.find(a => a.id === parseInt(req.params.articleId))
  if(!article){
    res.status(400).json({ message: 'Article non dans le panier impossible de le modifier ... '})
    return
  }
  if(req.body.quantity <= 0){
    res.status(400).json({message : 'Quantité non valide ... '})
    return
  }
  article.quantity = parseInt(req.body.quantity)

  res.status(200).json(req.session.panier)
})


router.delete('/panier/:articleId', (req, res) => {
  const article = req.session.panier.articles.find(a => a.id === parseInt(req.params.articleId))
  if(!article){
    res.status(400).json({ message: 'Article non dans le panier impossible de le supprimer ... '})
    return
  }
  console.log(article)
  const index = req.session.panier.articles.indexOf(article)
  console.log(index)
  req.session.panier.articles.splice(index, 1)
  res.status(200).json(req.session.panier)
})



router.get('/articles', (req, res) => {
  db.query("SELECT * FROM articles", function(err,result) {
    if (err) throw err;
    res.json(result)
  })
})


router.post('/article', (req, res) => {
  const name = req.body.name
  const description = req.body.description
  const image = req.body.image
  const price = parseInt(req.body.price)


  if (typeof name !== 'string' || name === '' ||
      typeof description !== 'string' || description === '' ||
      typeof image !== 'string' || image === '' ||
      isNaN(price) || price <= 0) {
    res.status(400).json({ message: 'bad request' })
    return
  }

  const article = {
    id: articles.length + 1,
    name: name,
    description: description,
    price: price,
    image: image
  }

  var sql = "INSERT INTO articles (name, description, price, image) VALUES ?";
  var value = [[article.name, article.description, article.price, article.image]];

  db.query(sql, [value], function(err, result) {
    if (err) throw err;
    res.json(article)
  });
})


function parseArticle (req, res, next) {
  const articleId = parseInt(req.params.articleId)

  if (isNaN(articleId)) {
    res.status(400).json({ message: 'articleId should be a number' })
    return
  }
  req.articleId = articleId

  const article = articles.find(a => a.id === req.articleId)
  if (!article) {
    res.status(404).json({ message: 'article ' + articleId + ' does not exist' })
    return
  }
  
  req.article = article
  next()
}

router.route('/article/:articleId')

  .get(parseArticle, (req, res) => {
    
    res.json(req.article)
  })


  .put(parseArticle, (req, res) => {
    const name = req.body.name
    const description = req.body.description
    const image = req.body.image
    const price = parseInt(req.body.price)

    req.article.name = name
    req.article.description = description
    req.article.image = image
    req.article.price = price
    res.send()
  })

  .delete(parseArticle, (req, res) => {
    const index = articles.findIndex(a => a.id === req.articleId)

    articles.splice(index, 1) 
    res.send()
  })

module.exports = router
