const express = require('express');
const router = new express.Router();

const yahooFinance = require('yahoo-finance');
const dateFormat = require('dateformat');
const muniData = require( '../../../muniData.json');
module.exports = router;

const currentYear = new Date().getFullYear();
const pyShell = require("python-shell");

const adjustedMuniData = createNewObject( muniData );
/*
let runPy = new Promise( function(sucess, failure) {
	const { spawn } = require('child_process');
	const pyProg = spawn('python', ['./../../../generate.py']);

	pyProg.stdout.on('data', function(data){
		success(data);
	});
	pyProg.stderr.on('data', (data) => {
		failure(data);
	});
});

*/
router.get('/', (req, res, next) =>{
/*
	pyShell.run("generate.py",  function(err, result) {
		console.log('from python....', err);
	})
		
	runPy.then( function(fromPy) {
		console.log('from py...........',fromPy);
		res.send( createNewObject( muniData ));
	})
	.catch(err => console.log('Python promise error....',err));
*/
	res.send( adjustedMuniData );

})


router.get('/filter', (req, res, next) => {

	let maturityRange  = [];
	let filteredMunis = [];

	for(let i = req.query.min; i <= req.query.max; i++){
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

