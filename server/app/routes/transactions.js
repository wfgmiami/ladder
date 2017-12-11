const express = require('express');
const router = new express.Router();

const yahooFinance = require('yahoo-finance');
const dateFormat = require('dateformat');
const transactionData = require( '../../../trans.json');
module.exports = router;

router.get('/', (req, res, next) => {
	res.send( createNewObject( transactionData.transactions ));
})


router.get('/nasdaq/filter', (req, res, next) => {

	const { sector } = req.query;
	let filteredArray = [];
	sector.forEach( sect => {
		let tempArray = nasdaqData.filter( stock => stock.Sector === sect );
		filteredArray = filteredArray.concat( tempArray );
	})

	res.send( createNewObject( filteredArray ));
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


createNewObject = ( arr ) => {
	let obj = {};
	let transactions = [];

	arr.forEach( transaction => {
		obj.amount = transaction.amount;
		obj.category = transaction.category;
		obj.name = transaction.name;
		obj.purchaseDate = transaction.date;
		transactions.push(obj)
		obj= {};
	})
	return transactions;
}

