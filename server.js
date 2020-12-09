if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

console.log(stripeSecretKey, stripePublicKey);

const express = require('express');
const stripe = require('stripe')(stripeSecretKey);
const fs = require('fs');
const app = express();
app.use(express.json());

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/store', function (req, res) {
    fs.readFile('items.json', function (err, data) {
        if(err) {
            res.status(500).end();
        } else {
            res.render('store.ejs', {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })
})

app.post('/purchase', function (req, res) {
    fs.readFile('items.json', function (err, data) {
        if(err) {
            res.status(500).end();
        } else {
            const itemsJson = JSON.parse(data);
            const itemsArray = itemsJson.music.concat(itemsJson.merch);
            var total = 0;
            req.body.items.forEach(function (item){
                const itemJson = itemsArray.find(function (i) {
                    return i.id == item.id;
                })
                total = total + itemJson.price * item.quantity;
            })
        }


        stripe.charges.create({
            amount: total,
            source: req.body.stripeTokenId,
            currency: 'usd'
        }).then(function() {
            res.json({message: 'successfully purchased'})
        }).catch(function () {
            console.log('charge failed')
            res.status(500).end()
        })
    })
})


app.listen(3000);