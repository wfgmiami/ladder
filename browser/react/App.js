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
		ladder:[]
	};
  	
	this.filterMaturity = this.filterMaturity.bind(this);
	this.generateLadder = this.generateLadder.bind(this);
  	this.createRanking = this.createRanking.bind(this);
  }



  componentDidMount() {
    axios.get('/api/munis')
      .then(response => response.data)
      .then( munis  => {
//		console.log('.............munis', munis);
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
			console.log('.....ladder..', this.state.ladder)
			
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

	ladderBuckets.forEach( bucket => {

		let selectedMunis = this.state.munis.filter( muni => muni.ytm == bucket );
		let healthCareMunis = selectedMunis.filter( muni => muni.sector == 'Health Care' );
		let aRated = selectedMunis.filter( muni => muni.rating == 'A' );
		let aaRated = selectedMunis.filter( muni => muni.rating.slice(0,2) == 'AA' );
		let couponRated = selectedMunis.sort( ( a,b ) => b.coupon - a.coupon );		
		rankedMunis[bucket]=[{ 'HealthCare':healthCareMunis, 'aRated': aRated, 'aaRated': aaRated, 'couponRated': couponRated }]; 
	   	
	})
//	console.log('rankedMunis')
	ladderBuckets.forEach( bucket => {
			aRatedPruned[bucket] = rankedMunis[bucket][0]['aRated'].filter( function(muni){ return !this.has(muni.cusip) }, new Set(rankedMunis[bucket][0]['HealthCare'] ));
		

			aRatedPruned[bucket].forEach( aRated => {
				aaRatedPruned[bucket] = rankedMunis[bucket][0]['aaRated'].filter( muni => muni.cusip != aRated.cusip );
			})

			aaRatedPruned[bucket].forEach( aaRated => {
				couponPruned[bucket] = rankedMunis[bucket][0]['couponRated'].filter( muni => muni.cusip != aaRated.cusip ); 
			})
	})

  console.log('....ranked Munis', rankedMunis);
  console.log('....aRatedPruned[3]', aRatedPruned[3]);			
  }

  generateLadder(investedAmount){
	console.log('in generate ladder, investedAmount', investedAmount);

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
