var express = require('express');
var router = express.Router();
const auth = require("./tokenvalidation")

/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.cookies._vcaitoken) res.redirect("/search");
    else res.render('signin.html', { title: 'Authenticate - Login' });
});

router.get('/verify', function (req, res, next) {
    var emailAddress = req.cookies._vcaiemail;
    var maskid = emailAddress.replace(/^(.)(.*)(.@.*)$/,
        (_, a, b, c) => a + b.replace(/./g, '*') + c
    );

    res.render('verify.html', { title: 'Verify OTP code', email: maskid });
});

module.exports = router;
