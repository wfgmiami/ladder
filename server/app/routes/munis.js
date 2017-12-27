const express = require('express');
const router = new express.Router();
const fs = require('fs');

module.exports = router;
const currentYear = new Date().getFullYear();

// const muniData = require( '../../../muni-data.json');
// const adjustedMuniData = createNewObject( muniData );

// fs.writeFile( './muni-list.json', JSON.stringify( adjustedMuniData ), 'utf-8', function( err ) {
// 	if ( err ) throw err;
// 	console.log('done')
// })


const adjustedMuniData = require( '../../../muni-list.json');

router.get('/', (req, res, next) =>{
	res.send( adjustedMuniData );
})

router.get('/filter', (req, res, next) => {
	let maturityRange  = [];
	let filteredMunis = [];
	let minMaturity = req.query.min * 1;
	let maxMaturity = req.query.max * 1;

	for(let i = minMaturity; i <= maxMaturity; i++){
		maturityRange.push(i * 1);
	}

	maturityRange.forEach( maturity => {
		let tempArray = adjustedMuniData.filter( muni => {
			   	return muni.ytm * 1 === maturity
		});

		filteredMunis = filteredMunis.concat( tempArray );
	})
	res.send( filteredMunis );
})


function createNewObject(arr) {
	let obj = {};
	let munis = [];

	arr.forEach( muni => {
		obj.cusip = muni.CUSIP;
		obj.price = muni['Market Price'];
		obj.coupon = muni.Coupon;
		obj.maturity = muni['Stated Maturity'];
		let maturityYear = obj.maturity.slice(-4);
		obj.ytm = maturityYear - currentYear;
		if (obj.ytm < 0) obj.ytm = 0;
		obj.sector = muni['Holdings Sector'];
		obj.rating = muni['Opinion Internal Rating'];
		obj.state = muni.State;
		obj.lastTraded = muni.LastTraded;
		munis.push(obj)
		obj= {};
	})

	return munis;
}

