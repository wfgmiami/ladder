import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Nav from './Nav';
import MuniList from './MuniList';
import Maturity from './Maturity';
import Constraint from './Constraint';
import InvestedAmount from './InvestedAmount';
import BucketAllocation from './BucketAllocation';


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
		munis:[],
		ladder:[],
		rank:[],
		amount:[]
	};
  	
	this.filterMaturity = this.filterMaturity.bind(this);
	this.generateLadder = this.generateLadder.bind(this);
  	this.createRanking = this.createRanking.bind(this);
  }
  componentDidMount() {
    axios.get('/api/munis')
      .then(response => response.data)
      .then( munis  => {
  	  	this.setState({ munis })
	  })
      .catch(err => console.log(err));
  }

  filterMaturity( filter ){
	let url = '/api/munis/filter';
	let ladder = [];
	for(let i = filter.min; i <= filter.max; i++){
		ladder.push(i);	
	}
	this.setState({ ladder });
	axios.get(url, { params: filter })
		.then( response => response.data )
		.then( munis => {
			this.setState( { munis } );
		})
		.then( () => this.createRanking() )
		.catch( err => console.log( err ) );
  }

  createRanking(){
	const ladderBuckets = this.state.ladder;
	let rankedMunis = {};
	let aRatedPruned = {};
	let aaRatedPruned = {};
	let couponPruned = {};
	let tempObj = {};
	let finalRank = [];

	ladderBuckets.forEach( bucket => {

		let selectedMunis = this.state.munis.filter( muni => muni.ytm == bucket );
		let healthCareMunis = selectedMunis.filter( muni => muni.sector == 'Health Care' );
		let aRated = selectedMunis.filter( muni => muni.rating == 'A' ).concat( selectedMunis.filter( muni => muni.rating == 'A+') )
					.concat( selectedMunis.filter( muni => muni.rating == 'A-' )).concat( selectedMunis.filter( muni => muni.rating.slice(0,2) == 'A/' ));
		let aaRated = selectedMunis.filter( muni => muni.rating.slice(0,2) == 'AA' );
		let couponRated = selectedMunis.sort( ( a,b ) => b.coupon - a.coupon );		
		rankedMunis[bucket]=[{ 'HealthCare':healthCareMunis, 'aRated': aRated, 'aaRated': aaRated, 'couponRated': couponRated }]; 
	   	
	})

	ladderBuckets.forEach( bucket => {
			rankedMunis[bucket][0]['HealthCare'].forEach( hcMuni => tempObj[hcMuni.cusip] = hcMuni );
			aRatedPruned[bucket] = rankedMunis[bucket][0]['aRated'].filter( aRated => !(aRated.cusip in tempObj ));
			aaRatedPruned[bucket] = rankedMunis[bucket][0]['aaRated'].filter( aaRated => !(aaRated.cusip in tempObj ));	
			couponPruned[bucket] = rankedMunis[bucket][0]['couponRated'].filter( couponMuni => !(couponMuni.cusip in tempObj ));
		
			tempObj = {};
			rankedMunis[bucket][0]['aRated'].forEach( aRated => tempObj[aRated.cusip] = aRated );
			couponPruned[bucket] = couponPruned[bucket].filter( couponMuni => !(couponMuni.cusip in tempObj ));
		
			tempObj = {};
			rankedMunis[bucket][0]['aaRated'].forEach( aaRated => tempObj[aaRated.cusip] = aaRated );
			couponPruned[bucket] = couponPruned[bucket].filter( couponMuni => !(couponMuni.cusip in tempObj ));

			finalRank[bucket] = rankedMunis[bucket][0]['HealthCare'].concat(aRatedPruned[bucket]).concat(aaRatedPruned[bucket]).concat(couponPruned[bucket]);
			tempObj = {};
	})
	this.setState({ rank: finalRank });
 	console.log('....ranked Munis', rankedMunis);
  	console.log('....final', finalRank[3]);			
  }

  generateLadder(investedAmount){
	let numBuckets = 1;
	console.log('in generate ladder, investedAmount', investedAmount);
	this.setState({ amount: investedAmount });
	if( this.state.ladder.length != 0) numBuckets = this.state.ladder.length;
	console.log('bucke lenght', this.state.ladder.length, numBuckets);	
	const bucketMoney = Number(( investedAmount / numBuckets ).toFixed(0));
	const minAllocCheck = Number((0.1 * bucketMoney).toFixed(0));
	console.log('min aloc check', minAllocCheck);
	if( minAllocCheck < 25000 ) {
		alert(`10% of the cash in a bucket is ${ minAllocCheck.toLocaleString() }. This is less that minimum of 25K allocation`);
		return;
	}
	console.log('bucketmoney....', bucketMoney);
  }

   render() {
    // console.log('.....in App.js, state, props',this.state, this.props)
    const munis = [...this.state.munis];
    return (
      <div className="container-fluid">
        <Nav />
        <div style={{ marginTop: '65px' }}>
          <div className="row">

            <div className="col-sm-5">
            	<MuniList munis={ munis }/>
            </div>
		    	
				<div className="col-sm-2">
					<Maturity filterMaturity = { this.filterMaturity }/>
				</div>

				<div className="col-sm-2">
					<InvestedAmount generateLadder = { this.generateLadder }/> 
				</div>
				
				<div className="col-sm-3">
					<Constraint />
				</div>	
				<div>&nbsp;</div><div>&nbsp;</div>
				<div>
					<BucketAllocation />
				</div>	
          
		 </div>

        </div>
      </div>
    );
  }
}


export default App;
