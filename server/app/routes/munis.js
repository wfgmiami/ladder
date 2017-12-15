const express = require('express');
const router = new express.Router();
const fs = require('fs')

const yahooFinance = require('yahoo-finance');
const dateFormat = require('dateformat');
const muniData = require( '../../../muniData.json');
module.exports = router;

const currentYear = new Date().getFullYear();
const pyShell = require("python-shell");

const adjustedMuniData = createNewObject( muniData );

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

router.get('/nasdaq/search', (req, res, next) => {

	let searchedArray = [];
	const { searchedStock } =  req.query;

	nasdaqData.forEach( stock => {
		if( stock.Name.toUpperCase().indexOf( searchedStock.toUpperCase() ) > -1 ){
			searchedArray.push( stock );
		}
	})
//	searchedArray = nasdaqData.filter( stock => stock.Name === searchedStock );
	res.send( createNewObject( searchedArray ));
})


function createNewObject(arr) {
	let obj = {};
	let munis = [];

	arr.forEach( muni => {
		obj.cusip = muni.CUSIP;
		obj.coupon = muni.Coupon;
		obj.maturity = muni['Stated Maturity'];
		let maturityYear = obj.maturity.slice(-4);
		obj.ytm = maturityYear - currentYear;
		if (obj.ytm < 0) obj.ytm = 0;
		obj.sector = muni['Holdings Sector'];
		obj.rating = muni['Opinion Internal Rating'];
		munis.push(obj)
		obj= {};
	})

	return munis;
}

