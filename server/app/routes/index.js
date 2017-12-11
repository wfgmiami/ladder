'use strict';

const router = require('express').Router();

module.exports = router;

router.use('/quote', require('./quote'));
router.use('/transactions', require('./transactions'));

router.use( ( req, res ) => {
	res.status( 404 ).end;
} );



