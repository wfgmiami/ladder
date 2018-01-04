import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import Nav from './Nav';
import MuniList from './MuniList';
import Maturity from './Maturity';
import Constraint from './Constraint';
import InvestedAmount from './InvestedAmount';
import BucketAllocation from './BucketAllocation';
import BucketSummary from './BucketSummary';
import muniList from '../../muniData.json';
import BucketSummaryPlaceholder from './BucketSummaryPlaceholder';
import css from '../../assets/stylesheets/style.scss';

const Promise = require('es6-promise-promise');

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
			maxPercBond: 0.1,
			minAllocBond: 25000,
			minIncrement: 5000,
			maxAllocBond: 100000,
			maxSector: 0.20,
			maxHealthCare: 0.12,
			maxRating: 0.30,
			maxCAState: 0.2,
			maxNYState: 0.2,
			munis:[],
			ytmLadder:[],
			rankedMuniList:[],
			allocatedData: [],
			allocSector: {},
			allocRating: {},
			investedAmount: 1000000,
			bucketsByRows: [],
			columns: [],
			portfolioSummary: [],
			healthCare: 0,
			aRatingAndBelow: 0,
			sector:{},
			ranking: ['HealthCare', 'nyMunis', 'caMunis', 'aRated', 'aaRated', 'couponRated'],
			cashReducer: 'Yes'
		};

		this.filterMaturity = this.filterMaturity.bind(this);
		this.setLadder = this.setLadder.bind(this);
		this.generateLadder = this.generateLadder.bind(this);
		this.createRanking = this.createRanking.bind(this);
		this.createRows = this.createRows.bind(this);
		this.createColumns = this.createColumns.bind(this);
		this.createSummary = this.createSummary.bind(this);
		this.lookForBondInDiffRanking = this.lookForBondInDiffRanking.bind(this);
		this.checkBondForLimitSize = this.checkBondForLimitSize.bind(this);
		this.allocateData = this.allocateData.bind(this);
		this.handleLimit = this.handleLimit.bind(this);
		this.allocateCash = this.allocateCash.bind(this);
		this.handleMinAllocChange = this.handleMinAllocChange.bind(this);
		this.handleCashReducerChange = this.handleCashReducerChange.bind(this);
  }

  componentDidMount() {
	this.setState({ munis: muniList } );
  }
	
  	handleMinAllocChange( minAlloc ){
		this.setState( { minAllocBond:  minAlloc } );
	}

	handleCashReducerChange( cashReducer ){
		this.setState( { cashReducer:  cashReducer } );
	}

	filterMaturity( filter ){
		let url = '/api/munis/filter';
		let ytmLadder = [];
		for(let i = filter.min; i <= filter.max; i++){
			ytmLadder.push(i);
		}
		this.setState({ ytmLadder });
		axios.get(url, { params: filter })
			.then( response => response.data )
			.then( munis => {
				this.setState( { munis } );
			})
			.then( () => this.createRanking() )
			.catch( err => console.log( err ) );
  }

  createRanking(){
		const ladderBuckets = this.state.ytmLadder;
		let rankedMunis = {};
		let nyPruned = {};
		let caPruned = {};
		let aRatedPruned = {};
		let aaRatedPruned = {};
		let couponPruned = {};
		let tempObj = {};
		let rankedMuniList = [];
		let selectedMunis = [];
		let sortedByTrade = {};
		let sortedByTradeMunis = [];

		ladderBuckets.forEach( bucket => {
			let munis = this.state.munis.filter( muni => muni.ytm == bucket );
			let healthCareMunis = munis.filter( muni => muni.sector == 'Health Care' );
			healthCareMunis.forEach( hcMuni => hcMuni.rank = 'HealthCare' );
			let nyMunis = munis.filter( muni => muni.state == 'NY' );
			let caMunis = munis.filter( muni => muni.state == 'CA' );
			let aRated = munis.filter( muni => muni.rating == 'A' )
								.concat( munis.filter( muni => muni.rating == 'A+') )
								.concat( munis.filter( muni => muni.rating == 'A-' ))
								.concat( munis.filter( muni => muni.rating.slice(0,2) == 'A/' ));
			let aaRated = munis.filter( muni => muni.rating.slice(0,2) == 'AA' );
			let couponRated = munis.sort( ( a,b ) => b.coupon - a.coupon );
			rankedMunis[bucket]=[{ 'HealthCare': healthCareMunis, 'nyMunis': nyMunis, 'caMunis': caMunis, 'aRated': aRated, 'aaRated': aaRated, 'couponRated': couponRated }];

		})

		ladderBuckets.forEach( bucket => {
				rankedMunis[bucket][0]['HealthCare'].forEach( hcMuni => tempObj[hcMuni.cusip] = hcMuni );
				nyPruned[bucket] = rankedMunis[bucket][0]['nyMunis'].filter( nyMuni => !( nyMuni.cusip in tempObj ));
				caPruned[bucket] = rankedMunis[bucket][0]['caMunis'].filter( caMuni => !( caMuni.cusip in tempObj ));
				aRatedPruned[bucket] = rankedMunis[bucket][0]['aRated'].filter( aRated => !(aRated.cusip in tempObj ));
				aaRatedPruned[bucket] = rankedMunis[bucket][0]['aaRated'].filter( aaRated => !(aaRated.cusip in tempObj ));
				couponPruned[bucket] = rankedMunis[bucket][0]['couponRated'].filter( couponMuni => !(couponMuni.cusip in tempObj ));

				tempObj = {};
				rankedMunis[bucket][0]['nyMunis'].forEach( nyMuni => tempObj[nyMuni.cusip] = nyMuni );
				aRatedPruned[bucket] = aRatedPruned[bucket].filter( aRated => !( aRated.cusip in tempObj ));
				aaRatedPruned[bucket] = aaRatedPruned[bucket].filter( aaRated => !( aaRated.cusip in tempObj ));
				couponPruned[bucket] = couponPruned[bucket].filter( couponMuni => !(couponMuni.cusip in tempObj ));

				tempObj = {};
				rankedMunis[bucket][0]['caMunis'].forEach( caMuni => tempObj[caMuni.cusip] = caMuni );
				aRatedPruned[bucket] = aRatedPruned[bucket].filter( aRated => !( aRated.cusip in tempObj ));
				aaRatedPruned[bucket] = aaRatedPruned[bucket].filter( aaRated => !( aaRated.cusip in tempObj ));
				couponPruned[bucket] = couponPruned[bucket].filter( couponMuni => !(couponMuni.cusip in tempObj ));

				tempObj = {};
				rankedMunis[bucket][0]['aRated'].forEach( aRated => tempObj[aRated.cusip] = aRated );
				couponPruned[bucket] = couponPruned[bucket].filter( couponMuni => !(couponMuni.cusip in tempObj ));

				tempObj = {};
				rankedMunis[bucket][0]['aaRated'].forEach( aaRated => tempObj[aaRated.cusip] = aaRated );
				couponPruned[bucket] = couponPruned[bucket].filter( couponMuni => !(couponMuni.cusip in tempObj ));

				nyPruned[bucket].forEach( couponRatedMuni => couponRatedMuni.rank = 'nyRated');
				caPruned[bucket].forEach( couponRatedMuni => couponRatedMuni.rank = 'caRated');
				aRatedPruned[bucket].forEach( couponRatedMuni => couponRatedMuni.rank = 'aRated');
				aaRatedPruned[bucket].forEach( couponRatedMuni => couponRatedMuni.rank = 'aaRated');
				couponPruned[bucket].forEach( couponRatedMuni => couponRatedMuni.rank = 'couponRated');

				rankedMuniList[bucket] = { 'HealthCare': rankedMunis[bucket][0]['HealthCare'], 'nyMunis': nyPruned[bucket], 'caMunis': caPruned[bucket], 'aRated': aRatedPruned[bucket], 'aaRated': aaRatedPruned[bucket], 'couponRated': couponPruned[bucket] };
				tempObj = {};
		})

		ladderBuckets.forEach( bucket => {
			Object.keys( rankedMuniList[bucket] ).forEach( rank => {
				selectedMunis = rankedMuniList[bucket][rank].map( function( muni, id ) { return { id: id, dt: new Date( muni.lastTraded ).getTime(), muni: muni } } )
							.sort( ( a,b ) => b.dt - a.dt )
							.map( muni => rankedMuniList[bucket][rank][muni.id] );

				sortedByTrade[rank] = selectedMunis;
			})

			sortedByTradeMunis[bucket] = sortedByTrade;
			sortedByTrade = {};
		})


		this.setState({ rankedMuniList: sortedByTradeMunis });
  }

	setLadder( investedAmount ){

		const buckets = [...this.state.ytmLadder];
		let bucketsObj = {};
		let bucketStateKeys = [];

		for( let i = buckets[0]; i <= buckets[buckets.length - 1]; i++ ){
			bucketsObj[i] = { currentRankIndex: 0, currentBondIndex: 0, filled: false, amountAllocated: 0, allocSector: {},allocRating: {}, allocState: {} };
		}

		bucketStateKeys = Object.keys( bucketsObj )
		.sort( function(a,b){ return b - a } )

		bucketsObj['bucketStateKeys'] = bucketStateKeys;

		this.setState({ investedAmount }, () => {
			this.generateLadder( bucketsObj );
		});


	}

	allocateData( argsObj, allocatedData, allocBucket, allocSector, allocRating, allocState, bucketState, bucket ){

		const investedAmount = this.state.investedAmount;
		const maxHealthCare = this.state.maxHealthCare * investedAmount;
		const maxSector = this.state.maxSector * investedAmount;
		const maxNYState = this.state.maxNYState * investedAmount;
		const maxCAState = this.state.maxCAState * investedAmount;
		const maxAandBelow = this.state.maxRating * investedAmount;
		const minIncrement = this.state.minIncrement;
		const allocatedAmount = argsObj.allocatedAmount;
		const args = [].slice.call( arguments );
		const bucketMoney = argsObj.bucketMoney;
		const ranking = argsObj.ranking;
		let currentBondIndex = argsObj.currentBucketState.currentBondIndex - 1;
		let previousBucket = 0;
		let previousAllocatedBond = '';
		let checkSector = '';
		let chosenBond = argsObj.chosenBond;
		let sector = argsObj.chosenBond.sector;
		let rating = argsObj.chosenBond.rating;
		let state = argsObj.chosenBond.state;
		let checkBucket = 0;
		let minIncrementToAllocate  = 0;
		let bucketLastIndex = 0;
		let idx = 0;
		let allocateToCash = 0;
		let sectorLimitCheck = 0;
		let nyStateLimitCheck = 0;
		let caStateLimitCheck = 0;
		let aAndBelowLimitCheck = 0;
		let currBucketIdx = 0;
		let statePlaceholder = '';
		let lastBucket = '';
		let checkState = '';
		let checkRating = '';
		let checkedAll = false;
		let checkedRating = false;
		let maxStateHit = false;
		let maxSectorHit = false;
		let maxAandBelowHit = false;
		let sectorAdjustedBond = null;
		let stateAdjustedBond = null;
		let aAndBelowAdjustedBond = null;
		let adjustedBond = null;
		let cashObject = {};
		const availableBuckets = argsObj.buckets;
		const availableBucketsLen = argsObj.buckets.length - 1;

		if( rating === '' ) rating = 'B';

		chosenBond['investAmt'] = allocatedAmount;

		allocBucket[bucket] ? allocBucket[bucket] += allocatedAmount
		: allocBucket[bucket] = allocatedAmount;

		allocatedData[bucket] ? allocatedData[bucket].push( chosenBond )
		: allocatedData[bucket] = [chosenBond];

		if(	chosenBond.cusip !== 'Cash' ){
			allocSector[sector] ? allocSector[sector] += allocatedAmount
			: allocSector[sector] = allocatedAmount;
		}

		if( rating.slice(0,2) !== 'AA' ){
			allocRating['aAndBelow'] ? allocRating['aAndBelow'] += allocatedAmount
			: allocRating['aAndBelow'] = allocatedAmount
		}

		if( state == 'NY' ){
			allocState['NY'] ? allocState['NY'] += allocatedAmount
			: allocState['NY'] = allocatedAmount
		}else if( state == 'CA' ){
			allocState['CA'] ? allocState['CA'] += allocatedAmount
			: allocState['CA'] = allocatedAmount
		}

		const bucketInfo = {
			allocSector,
			allocState,
			allocBucket,
			allocRating,
			allocatedData,
			minIncrement,
			maxHealthCare,
			maxSector,
			maxAandBelow,
			maxNYState,
			maxCAState,
			availableBuckets,
			chosenBond,
			allocatedAmount,
			bucket,
			rating,
			ranking,
			sector,
			argsObj,
			state,
			bucketState,
			aAndBelowAdjustedBond,
			sectorAdjustedBond,
			stateAdjustedBond
		}

		if( ( sector === 'Health Care' && allocSector[sector] > maxHealthCare ) || allocSector[sector] > maxSector ){
		//	debugger;
			maxSectorHit = true;
			sector === 'Health Care' ? bucketInfo.calledBy = 'HealthCare' : bucketInfo.calledBy = 'sector';
				this.handleLimit( bucketInfo );
				sectorAdjustedBond = bucketInfo.sectorAdjustedBond;
		}

		if( allocState['CA'] >= maxCAState  || allocState['NY'] >= maxNYState ){
		  //debugger;
			maxStateHit = true;
			state === 'CA' ? statePlaceholder = 'CA' : statePlaceholder = 'NY';
			bucketInfo.calledBy = statePlaceholder;
			this.handleLimit( bucketInfo );
			stateAdjustedBond = bucketInfo.stateAdjustedBond;
		}

		if( allocRating['aAndBelow'] >= maxAandBelow ){
			//debugger;
			maxAandBelowHit = true;
			bucketInfo.calledBy = 'aAndBelow';
			this.handleLimit( bucketInfo );
			aAndBelowAdjustedBond = bucketInfo.aAndBelowAdjustedBond;
		}


		if( allocBucket[bucket] >= bucketMoney ){
			debugger;

			if( maxSectorHit || maxAandBelowHit || maxStateHit ){

				if( argsObj.bucketControl['nextBucket'] ){
					argsObj.bucketControl['nextBucket'] = null;
					adjustedBond = allocatedData[bucket][allocatedData[bucket].length - 1];
				}else{
					adjustedBond = !bucketInfo.sectorAdjustedBond ? ( !bucketInfo.stateAdjustedBond ? ( !bucketInfo.aAndBelowAdjustedBond ? null : bucketInfo.aAndBelowAdjustedBond ) : bucketInfo.stateAdjustedBond ) : bucketInfo.sectorAdjustedBond;
				}

				if( !adjustedBond ){
					adjustedBond = allocatedData[bucket][allocatedData[bucket].length - 1];
				}

				let amountToRemove = adjustedBond['investAmt'];
				allocSector[sector] -= amountToRemove;
				allocBucket[bucket] -= amountToRemove;
				adjustedBond['investAmt'] -= amountToRemove;
				if( adjustedBond.rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] -= amountToRemove;
				argsObj.currentBucketState.amountAllocated -= amountToRemove;
				minIncrementToAllocate = ( bucketMoney - allocBucket[bucket] ) / ( minIncrement * (  adjustedBond.price * 1 / 100 ) );
				minIncrementToAllocate = Math.floor( minIncrementToAllocate ) * ( minIncrement *  adjustedBond.price * 1 / 100 );
				allocBucket[bucket] += minIncrementToAllocate;
				allocSector[sector] += minIncrementToAllocate;
				adjustedBond['investAmt'] += minIncrementToAllocate;
				if( adjustedBond.rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] += minIncrementToAllocate;

				allocateToCash = bucketMoney - allocBucket[bucket];
				cashObject['cusip'] = 'Cash';
				cashObject['investAmt'] = allocateToCash;
				allocatedData[bucket].push( cashObject );
				allocSector['Cash'] += allocateToCash;

			}else{
				allocSector[sector] -= allocatedAmount;
				allocBucket[bucket] -= allocatedAmount;
				argsObj.currentBucketState.amountAllocated -= allocatedAmount;
				chosenBond['investAmt'] -= allocatedAmount;
				if( rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] -= allocatedAmount;
				if( state === 'NY' ) allocState['NY'] -= allocatedAmount;
				if( state === 'CA' ) allocState['CA'] -= allocatedAmount;
				idx = allocatedData[bucket].length - 2;
				previousAllocatedBond = allocatedData[bucket][idx];

				sectorLimitCheck = allocSector[previousAllocatedBond.sector];
				nyStateLimitCheck = allocState['NY'];
				caStateLimitCheck = allocState['CA'];
				aAndBelowLimitCheck = allocRating['aAndBelow'];

				minIncrementToAllocate = ( bucketMoney - allocBucket[bucket] ) / ( minIncrement * ( previousAllocatedBond.price * 1 / 100 ) );

				minIncrementToAllocate = Math.floor( minIncrementToAllocate ) * ( minIncrement * previousAllocatedBond.price * 1 / 100 );

				console.log('............previousAllocatedBond--', previousAllocatedBond);
				sectorLimitCheck += minIncrementToAllocate;
				if( previousAllocatedBond.state === 'NY' ) nyStateLimitCheck += minIncrementToAllocate;
				if( previousAllocatedBond.state === 'CA' ) caStateLimitCheck += minIncrementToAllocate;
				if( previousAllocatedBond.rating.slice(0,2) !== 'AA' ) aAndBelowLimitCheck += minIncrementToAllocate;

				if( ( previousAllocatedBond.sector === 'Health Care' && sectorLimitCheck  > maxHealthCare )
				|| ( sectorLimitCheck > maxSector ) || ( nyStateLimitCheck > maxNYState || caStateLimitCheck > maxCAState )
				|| ( aAndBelowLimitCheck > maxAandBelow ) ){

					allocateToCash = bucketMoney - allocBucket[bucket];

					cashObject['cusip'] = 'Cash';
					cashObject['investAmt'] = allocateToCash;
					allocatedData[bucket].splice( allocatedData[bucket].length - 1, 1 );
					allocatedData[bucket].push( cashObject );
					allocSector['Cash'] += allocateToCash;
					allocBucket[bucket] += minIncrementToAllocate;
					bucketState[bucket]['investAmt'] += minIncrementToAllocate;

				}else{

					allocBucket[bucket] += minIncrementToAllocate;
					allocSector[sector] += minIncrementToAllocate;
					previousAllocatedBond['investAmt'] += minIncrementToAllocate;
					if( previousAllocatedBond.rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] += minIncrementToAllocate;

					allocateToCash = bucketMoney - allocBucket[bucket];
					cashObject['cusip'] = 'Cash';
					cashObject['investAmt'] = allocateToCash;
					allocatedData[bucket].splice( allocatedData[bucket].length - 1, 1 );
					allocatedData[bucket].push( cashObject );
					allocSector['Cash'] += allocateToCash;
				}

			}
			idx = argsObj.buckets.indexOf( bucket );
			argsObj.buckets.splice( idx, 1 );

		}
	}

	handleLimit( bucketInfo ){

		const allocSector = bucketInfo.allocSector;
		const allocBucket = bucketInfo.allocBucket;
		const allocState = bucketInfo.allocState;
		const currentBucketState = bucketInfo.argsObj.currentBucketState;
		const chosenBond = bucketInfo.chosenBond;
		const allocRating = bucketInfo.allocRating;
		const allocatedData = bucketInfo.allocatedData;
		const bucket = bucketInfo.bucket;
		const state = bucketInfo.state;
		const sector = bucketInfo.sector;
		const rating = bucketInfo.rating;
		const ranking = bucketInfo.ranking;
		const bucketState = bucketInfo.bucketState;
		const allocatedAmount = bucketInfo.allocatedAmount;
		const availableBuckets = bucketInfo.availableBuckets;
		const minIncrement = bucketInfo.minIncrement;
		const maxHealthCare = bucketInfo.maxHealthCare;
		const maxAandBelow = bucketInfo.maxAandBelow;
		const maxNYState = bucketInfo.maxNYState;
		const maxCAState = bucketInfo.maxCAState;
		const maxSector = bucketInfo.maxSector;
		const availableBucketsLen = bucketInfo.argsObj.buckets.length - 1;
		const calledBy = bucketInfo.calledBy;

		let sectorLimitCheck = 0;
		let nyStateLimitCheck = 0;
		let caStateLimitCheck = 0;
		let aAndBelowLimitCheck = 0;

		let bucketControl = bucketInfo.argsObj.bucketControl;
		let checkedAll = false;
		let previousAllocatedBond = '';
		let minIncrementToAllocate = 0;
		let rankIndex = null;
		let checkedRating = false;
		let checkRating = '';
		let checkRatingOrState = false;
		let statePlaceholder = '';
		let allocationLimit = '';
		let checkState = '';
		let checkSector = '';
		let currentAllocation = {};
		let allocatedDataLength = allocatedData[bucket].length - 1;

		if( calledBy === 'aAndBelow' ){
			ranking === 'aRated' ? rankIndex = 3 : rankIndex = null;
			allocationLimit = maxAandBelow;
		}else if( calledBy === 'NY' || calledBy === 'CA' ){
			calledBy === 'CA' ? statePlaceholder = 'CA' : statePlaceholder = 'NY';
			allocationLimit = statePlaceholder === 'CA' ? maxCAState : maxNYState;
			ranking === 'nyMunis' ? rankIndex = 1 : rankIndex = 2;
		}else if( calledBy === 'sector' || calledBy === 'HealthCare' ){
			allocationLimit = calledBy === 'sector' ? maxSector : maxHealthCare;
			ranking === 'HealthCare' ? rankIndex = 0 : null;
		}


		allocSector[sector] -= allocatedAmount;
		allocBucket[bucket] -= allocatedAmount;
		currentBucketState.amountAllocated -= allocatedAmount;
		chosenBond['investAmt'] -= allocatedAmount;
		if( rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] -= allocatedAmount;
		if( state === 'NY' ) allocState['NY'] -= allocatedAmount;
		if( state === 'CA' ) allocState['CA'] -= allocatedAmount;

		allocatedData[bucket].splice( allocatedDataLength, 1 );

		allocatedDataLength = allocatedData[bucket].length - 1;
		const lastBucket = availableBuckets[availableBucketsLen];
		let currBucketIdx = availableBuckets.indexOf(bucket);
		let checkBucket = availableBuckets[currBucketIdx];

		if( allocatedDataLength < 0 ){
			if( checkBucket > lastBucket ){
				checkBucket = availableBuckets[0];
				currBucketIdx = 0;
				allocatedDataLength = allocatedData[checkBucket].length - 1;
			}else{
				checkBucket = availableBuckets[++currBucketIdx];
				allocatedDataLength = allocatedData[checkBucket].length - 1;
			}
			if ( bucketControl['nextBucket'] === null ) bucketControl['nextBucket'] = bucket;
		}

		if( calledBy === 'aAndBelow' ){
			checkRating = allocatedData[checkBucket][allocatedDataLength].rating.slice(0,2);
			checkRating !== 'AA' ? checkedRating = true : checkedRating = false;
			checkRatingOrState = checkedRating;
			currentAllocation = allocRating['aAndBelow'];
		}else if( calledBy === 'NY' || calledBy === 'CA' ){
			checkState = allocatedData[checkBucket][allocatedDataLength].state;
			checkRatingOrState = checkState === state;
			currentAllocation = allocState[statePlaceholder];
		}else if( calledBy === 'sector' || calledBy === 'HealthCare' ){
			checkSector = allocatedData[checkBucket][allocatedDataLength].sector;
			checkRatingOrState = checkSector === sector;
			currentAllocation = allocSector[sector];
		}

		while( !checkRatingOrState && !checkedAll ){
			if( !allocatedDataLength ){
				if ( bucketControl['nextBucket'] === null ) bucketControl['nextBucket'] = bucket;

				if( ++checkBucket > lastBucket ){
					checkBucket = availableBuckets[0];
					currBucketIdx = 0;
					allocatedDataLength = allocatedData[checkBucket].length - 1;
					if( checkBucket === bucket ) checkedAll = true;
				}else{
					checkBucket = availableBuckets[++currBucketIdx];
					allocatedDataLength = allocatedData[checkBucket].length - 1;
					if( checkBucket === bucket ) checkedAll = true;
				}
			}else{
				if( availableBuckets[allocatedDataLength + 1] > lastBucket ){
					allocatedDataLength = 0;
				}else{
					allocatedDataLength--;
				}
			}

			if( calledBy === 'aAndBelow' ){
				checkRating = allocatedData[checkBucket][allocatedDataLength].rating.slice(0,2);
				if( checkRating !== 'AA' ) checkRatingOrState = true;
			}else if(  calledBy === 'NY' || calledBy === 'CA' ){
				checkState = allocatedData[checkBucket][allocatedDataLength].state;
				if( checkState === state ) checkRatingOrState = true;
			}else if( calledBy === 'sector' ){
				checkSector = allocatedData[checkBucket][allocatedDataLength].sector;
				if( checkSector === sector ) checkRatingOrState = true;
			}

		}

		if( !checkedAll ){

			previousAllocatedBond = allocatedData[checkBucket][allocatedDataLength];

			sectorLimitCheck = allocSector[previousAllocatedBond.sector];
			nyStateLimitCheck = allocState['NY'];
			caStateLimitCheck = allocState['CA'];
			aAndBelowLimitCheck = allocRating['aAndBelow'];

			minIncrementToAllocate = ( allocationLimit - currentAllocation ) / ( minIncrement * ( previousAllocatedBond.price * 1 / 100 ) );

			minIncrementToAllocate = Math.floor( minIncrementToAllocate ) * ( minIncrement * previousAllocatedBond.price * 1 / 100 );

			sectorLimitCheck += minIncrementToAllocate;
			if( previousAllocatedBond.state === 'NY' ) nyStateLimitCheck += minIncrementToAllocate;
			if( previousAllocatedBond.state === 'CA' ) caStateLimitCheck += minIncrementToAllocate;
			if( previousAllocatedBond.rating.slice(0,2) !== 'AA' ) aAndBelowLimitCheck += minIncrementToAllocate;

			if( ( previousAllocatedBond.sector === 'Health Care' && sectorLimitCheck > maxHealthCare )
			|| ( sectorLimitCheck > maxSector ) || ( nyStateLimitCheck > maxNYState || caStateLimitCheck > maxCAState )
			|| ( aAndBelowLimitCheck > maxAandBelow ) ){

				if ( bucketControl['nextBucket'] === null ) bucketControl['nextBucket'] = bucket;

			}else{

				allocBucket[checkBucket] += minIncrementToAllocate;
				allocSector[sector] += minIncrementToAllocate;
				currentBucketState.amountAllocated += minIncrementToAllocate;
				previousAllocatedBond['investAmt'] += minIncrementToAllocate;

				if( previousAllocatedBond.rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] += minIncrementToAllocate;
				if( previousAllocatedBond.state === 'NY' ) allocState['NY'] += minIncrementToAllocate;
				if( previousAllocatedBond.state === 'CA' ) allocState['CA'] += minIncrementToAllocate;

				if( ranking === 'aRated' || ranking === 'caMunis' || ranking === 'nyMunis' || ranking === 'HealthCare' ){
					bucketState.bucketStateKeys.forEach( bucket => {
						if( bucketState[bucket].currentRankIndex === rankIndex ){
							bucketState[bucket].currentRankIndex++;
							bucketState[bucket].currentBondIndex = 0;
						}
					})
				}

				if( calledBy === 'aAndBelow' ){
					bucketInfo.aAndBelowAdjustedBond =	previousAllocatedBond;
				}else if( calledBy === 'NY' || calledBy === 'CA' ){
					bucketInfo.stateAdjustedBond = previousAllocatedBond;
				}else if( calledBy === 'sector' || calledBy === 'HealthCare' ){
					bucketInfo.sectorAdjustedBond = previousAllocatedBond;
				}

			}

		}

		if ( minIncrementToAllocate === 0 ) bucketControl['nextBucket'] = bucket;

	}


	lookForBondInDiffRanking( argsObj ){
		const muniData = argsObj.muniBondInBucket;
		const ranking = this.state.ranking;
		const bucketMoney = argsObj.bucketMoney;
		const bucket = argsObj.bucket;
		let currentRankIndex = argsObj.currentBucketState.currentRankIndex;
		let amountAllocated = argsObj.currentBucketState.amountAllocated;
		let filled = argsObj.currentBucketState.filled;
		let chosenBond = argsObj.chosenBond;
		let idx = 0;
		let currentBondIndex = 0;

		while( !chosenBond && currentRankIndex < ranking.length - 1 ){
			chosenBond = muniData[ranking[++currentRankIndex]][currentBondIndex];
		}
		if( !chosenBond ){
			return argsObj;
		}

		argsObj.chosenBond = chosenBond;
		argsObj.currentBucketState.currentRankIndex = currentRankIndex;
		argsObj.currentBucketState.currentBondIndex = currentBondIndex;

		return argsObj;

	}


	checkBondForLimitSize( argsObj ){
		let chosenBond = argsObj.chosenBond;
		let allocatedAmount = 0;
		const sector = chosenBond.sector;
		const rating = chosenBond.rating;
		const state = chosenBond.state;
		const price = chosenBond.price;
		const minAllocBond = this.state.minAllocBond;
		const maxPercBond = this.state.maxPercBond;
		const investedAmount = this.state.investedAmount;

		if( minAllocBond * price / 100 > maxPercBond * investedAmount ){
			// !!!!!!!!!!!!!!!!!!!!!before switching ranking keep checking with the rest of the bonds
			argsObj = this.lookForBondInDiffRanking( argsObj )
			console.log('Limit size - minAlloc*price > max perc * inv amt - chosen bond---', argsObj)
			return argsObj;
		}else if ( minAllocBond * price / 100 > argsObj.bucketMoney ) {
			argsObj.chosenBond = null;
			return argsObj;
		}else{

			allocatedAmount = Number((minAllocBond * price / 100).toFixed(2));
			argsObj.allocatedAmount = allocatedAmount;

			argsObj.currentBucketState.amountAllocated += allocatedAmount;
			argsObj.currentBucketState.allocSector[sector] ? argsObj.currentBucketState.allocSector[sector] += allocatedAmount
			:argsObj.currentBucketState.allocSector[sector] = allocatedAmount;

			argsObj.currentBucketState.allocRating[rating] ? argsObj.currentBucketState.allocRating[rating] += allocatedAmount
			:argsObj.currentBucketState.allocRating[rating] = allocatedAmount;

			argsObj.currentBucketState.allocState[state] ? argsObj.currentBucketState.allocState[state] += allocatedAmount
			:argsObj.currentBucketState.allocState[state] = allocatedAmount;

			argsObj.currentBucketState.currentBondIndex++;

			return argsObj;
		}

	}

  generateLadder( bucketsObj ){

		let cnt = 0;
		let idx = 0;
		let currentBondIndex = 0;
		let price = 0;
		let amountToSector = 0
		let numBuckets = 1;
		let currentRankIndex = 0;
		let startIndex = 0;
		let allocateToCash = 0;
		let rating = '';
		let sector = '';
		let chosenBond = [];
		let arrBucketsToRemove = [];
		let buckets = [...this.state.ytmLadder];
		let allocSector =  {};
		let allocRating = {};
		let allocBucket = {};
		let allocState = {};
		let argsObj = {};
		let cashObject = {};
		let bucketControl = { nextBucket: null };
		let bucketState = Object.assign({}, bucketsObj);

		const muniData = [...this.state.rankedMuniList];
		const allocatedData = {};
		const ranking = this.state.ranking;
		const investedAmount = this.state.investedAmount;


		if( buckets.length !== 0 ) numBuckets = buckets.length;
		if( buckets.length === 0 ) {
			alert('Please select min and max maturity for the buckets!');
			return;
		}
		const bucketMoney = Number(( investedAmount / numBuckets ).toFixed(0));

		let bucketIndex = numBuckets - 1;
		let bucket = buckets[bucketIndex];
		allocSector['Cash'] = 0;
		console.log('Before the loop begins - muniData bucketState------', muniData, bucketState );

		do{
			currentRankIndex = bucketState[bucket]['currentRankIndex'];
			currentBondIndex = bucketState[bucket]['currentBondIndex'];
			if(bucket===2 && currentBondIndex===47) debugger;

			if( currentRankIndex < ranking.length ){

				chosenBond = muniData[bucket][ranking[currentRankIndex]][currentBondIndex];
				console.log("Start Of Loop - bucket, buckets, bucketIdx, bondIdx, rankIdx----", bucket, buckets, bucketIndex, currentBondIndex, currentRankIndex)
				argsObj = { muniBondInBucket: muniData[bucket], bucket, bucketMoney, currentBucketState: bucketState[bucket],  bucketState, chosenBond, bucketControl, buckets, ranking: ranking[currentRankIndex] };
			}

			if( !chosenBond && currentRankIndex < ranking.length ){
				argsObj = this.lookForBondInDiffRanking( argsObj )
				chosenBond = argsObj.chosenBond;

				if( chosenBond ){
					argsObj = this.checkBondForLimitSize( argsObj );
					console.log('chosenBond from diff ranking after look for Bond In Diff Ranking', argsObj.chosenBond)
					this.allocateData( argsObj, allocatedData, allocBucket, allocSector, allocRating, allocState, bucketState, bucket )
					//console.log("generateLadder after .......COMING FROM HEALTH CARE......bucket", bucket)
				}else{
					// bucketsToRemove[bucket] = bucket;
					cashObject = {};
					cashObject['cusip'] = 'Cash';
					cashObject['investAmt'] = bucketMoney;
					allocSector['Cash'] += bucketMoney;

					if( allocBucket[bucket] ){
						cashObject['investAmt'] -= allocBucket[bucket];
						allocSector['Cash'] -= allocBucket[bucket];
					}

					if( allocatedData[bucket] ) allocatedData[bucket].push( cashObject )
					else allocatedData[bucket] = [cashObject];
					idx = buckets.indexOf( bucket );
					buckets.splice( idx, 1 );

				//	console.log('splicing.......in main sub- bucket, idx, buckets, bucketIdx, chosenBond --- ', bucket, idx, buckets, bucketIndex, chosenBond);
				}

			}else if( currentRankIndex < ranking.length ){
				argsObj = this.checkBondForLimitSize( argsObj );
				if( !argsObj.chosenBond ){
					cashObject = {};
					cashObject['cusip'] = 'Cash';
					cashObject['investAmt'] = bucketMoney;
					allocSector['Cash'] += bucketMoney;
					if( allocatedData[bucket] ) allocatedData[bucket].push( cashObject );
					else allocatedData[bucket] = [cashObject];
					idx = buckets.indexOf( bucket );
					buckets.splice( idx, 1 );
				}else{
					this.allocateData( argsObj, allocatedData, allocBucket, allocSector, allocRating, allocState, bucketState, bucket )
				}

				console.log('Return from limit check bound found in Rank - bucket, argsObj, bucketState, allocBucket, allocSector, allocRating, allocatedData---', bucket, argsObj, bucketState, allocBucket, allocSector, allocRating, allocatedData)
			}else{

				cashObject = {};
				cashObject['cusip'] = 'Cash';
				cashObject['investAmt'] = bucketMoney;
				allocSector['Cash'] += bucketMoney;

				if( allocBucket[bucket] ){
					cashObject['investAmt'] -= allocBucket[bucket];
					allocSector['Cash'] -= allocBucket[bucket];
				}

				if( allocatedData[bucket] ) allocatedData[bucket].push( cashObject );
				else allocatedData[bucket] = [cashObject];
				idx = buckets.indexOf( bucket );
				buckets.splice( idx, 1 );
			}

			numBuckets = buckets.length;

			console.log('Before buckets change-numBuckets, bucket, bucketIdx, bucketControl --- ', numBuckets, bucket, bucketIndex, bucketControl)
			if( bucketControl['nextBucket'] ){
				// case when health care was allocated to previous bucket => do not change bucket
				bucketControl['nextBucket'] = null;

			}else{

				if( ( bucketIndex === 0 &&  numBuckets > 1 ) || ( numBuckets === 1 ) ){
					bucketIndex = numBuckets - 1;
					bucket = buckets[bucketIndex];
				}else if( bucketIndex === 0 && numBuckets === 1 ){
					console.log('one bucket only..............remain the same')
				}else if( numBuckets > 1 ){
					bucket = buckets[--bucketIndex]
				}

			}

		//cnt++
			//numBuckets > 0
		}while( numBuckets > 0 )

		console.log('.reducer',this.state.cashReducer);
		if( this.state.cashReducer === 'Yes' )
			this.allocateCash( allocatedData, allocSector, allocRating, allocState );


		let fields = Object.keys( allocRating );
		fields.forEach( field => {
			allocSector[field] = allocRating[field];
		})

		fields = Object.keys( allocState );
		fields.forEach( field => {
			allocSector[field] = allocState[field]
		})

		console.log('FINAL.....allocSector, allocatedData', allocSector, allocatedData);
		const portfolioSummary = this.createSummary( allocSector );
		const bucketsByRows = this.createRows( allocatedData );
		const columns = this.createColumns();
		console.log('SET FOR SHOW.....summary,rows,columns', portfolioSummary, bucketsByRows, columns);

		this.setState({ columns });
		this.setState({ bucketsByRows });
		this.setState({ allocatedData });
		this.setState({ allocSector });
		this.setState({ allocRating });
		this.setState({ portfolioSummary });

  }

  	allocateCash( allocatedData, allocSector, allocRating, allocState ){
		const munis = [...this.state.rankedMuniList];
		const investedAmount = this.state.investedAmount;
		const maxHealthCare = this.state.maxHealthCare * investedAmount;
		const maxSector = this.state.maxSector * investedAmount;
		const maxNYState = this.state.maxNYState * investedAmount;
		const maxCAState = this.state.maxCAState * investedAmount;
		const maxAandBelow = this.state.maxRating * investedAmount;
		const minIncrement = this.state.minIncrement;
		const ranking = this.state.ranking;
		let testBond = {};
		let buckets = [...this.state.ytmLadder];
		let allocatedCash = 0;
		let bucketLength = 0;

		let price = 0;
		let rating = null;
		let sector = null;
		let state = null;
		let minIncrementToAllocate = 0;
		let allocationLimit = 0;
		let currentAllocation = 0;
		let leftRoom = 0;
		let rankIndex = 0;
		let bondIndex = 0;

		debugger;

		buckets.forEach( bucketNumber => {
			let bucket = allocatedData[bucketNumber];
			bucketLength = bucket.length - 1;
			allocatedCash = bucket[bucketLength].investAmt;

			for( let i = 0; i < bucketLength; i++ ){

				price = bucket[i].price;
				sector = bucket[i].sector;
				allocationLimit = maxSector - allocSector[sector];
				currentAllocation = allocSector[sector];

				if( bucket[i].rank === 'HealthCare' ){
	 				leftRoom = maxHealthCare - allocSector[sector];
 					if( allocationLimit > leftRoom ){
						allocationLimit = leftRoom;
						currentAllocation = allocSector[sector]
					}
				}
				if( bucket[i].rank === 'nyRated' ){
			   		leftRoom = maxNYState - allocState['NY'];
					if( allocationLimit > leftRoom ){
						allocationLimit = leftRoom;
						currentAllocation = allocState['NY']
					}

				}
				if( bucket[i].rank === 'caRated' ){
					leftRoom = maxCAState - allocState['CA'];
					if( allocationLimit > leftRoom ){
						allocationLimit = leftRoom;
						currentAllocation = allocState['CA']
					}
				}
				if( bucket[i].rank === 'aRated' ){
					leftRoom = maxAandBelow - allocRating['aAndBelow'];
					if( allocationLimit > leftRoom ){
						allocationLimit = leftRoom;
						currentAllocation = allocRating['aAndBelow']
					}

				}

				minIncrementToAllocate = ( allocatedCash ) / ( minIncrement * ( price * 1 / 100 ) );
				minIncrementToAllocate = Math.floor( minIncrementToAllocate ) * ( minIncrement * ( price * 1 / 100 ) );

				if( minIncrementToAllocate > 0 && minIncrementToAllocate <= allocationLimit ){
					bucket[bucketLength].investAmt = allocatedCash - minIncrementToAllocate;
					bucket[i].investAmt += minIncrementToAllocate;
					if( bucket[i].state === 'NY' ) allocState['NY'] += minIncrementToAllocate;
					if( bucket[i].state === 'CA' ) allocState['CA'] += minIncrementToAllocate;
					if( bucket[i].rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] += minIncrementToAllocate;
					allocSector[sector] += minIncrementToAllocate;
					allocSector.Cash -= allocatedCash;
					allocSector.Cash += bucket[bucketLength].investAmt;
					allocatedCash = bucket[bucketLength].investAmt;

				}
			}

			if( allocatedCash >= 4000){

				do{
					for( let i = 0; i <  munis[bucketNumber][ranking[rankIndex]].length; i++ ){
						testBond = Object.assign( {}, munis[bucketNumber][ranking[rankIndex]][bondIndex] );
						price = testBond.price;
						sector = testBond.sector;
						allocationLimit = maxSector - allocSector[sector];
						currentAllocation = allocSector[sector];

						if( testBond.rank === 'HealthCare' ){
							 leftRoom = maxHealthCare - allocSector[sector];
							 if( allocationLimit > leftRoom ){
								allocationLimit = leftRoom;
								currentAllocation = allocSector[sector]
							}
						}
						if( testBond.rank === 'nyRated' ){
								 leftRoom = maxNYState - allocState['NY'];
							if( allocationLimit > leftRoom ){
								allocationLimit = leftRoom;
								currentAllocation = allocState['NY']
							}

						}
						if( testBond.rank === 'caRated' ){
							leftRoom = maxCAState - allocState['CA'];
							if( allocationLimit > leftRoom ){
								allocationLimit = leftRoom;
								currentAllocation = allocState['CA']
							}
						}
						if( testBond.rank === 'aRated' ){
							leftRoom = maxAandBelow - allocRating['aAndBelow'];
							if( allocationLimit > leftRoom ){
								allocationLimit = leftRoom;
								currentAllocation = allocRating['aAndBelow']
							}

						}

						minIncrementToAllocate = ( allocatedCash ) / ( minIncrement * ( price * 1 / 100 ) );
						minIncrementToAllocate = Math.floor( minIncrementToAllocate ) * ( minIncrement * ( price * 1 / 100 ) );

						if( minIncrementToAllocate > 0 && minIncrementToAllocate <= allocationLimit ){
							bucket[bucketLength].investAmt = allocatedCash - minIncrementToAllocate;
							testBond.investAmt = 0 +  minIncrementToAllocate;
							if( testBond.state === 'NY' ) allocState['NY'] += minIncrementToAllocate;
							if( testBond.state === 'CA' ) allocState['CA'] += minIncrementToAllocate;
							if( testBond.rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] += minIncrementToAllocate;
							allocSector[sector] += minIncrementToAllocate;
							allocSector.Cash -= allocatedCash;
							allocSector.Cash += bucket[bucketLength].investAmt;
							allocatedCash = bucket[bucketLength].investAmt;
							allocatedData[bucketNumber].splice(bucketLength, 0, testBond);
						}
						bondIndex++;
					}
					rankIndex++;
					bondIndex = 0;
				}while( rankIndex < ranking.length )
				rankIndex = 0;
			}

		})
	}

	createSummary( summary ){
		let fields = Object.keys( summary );
		let portfolioSummary = [];
		let rowObj = {};
		let arrangedPortfolioSummary = [];
		const columnFields = [ 'portfolioSummary', 'dollarAllocated', 'percentageAllocated', 'rule' ];

		fields.forEach( field => {
			rowObj[columnFields[0]] = field;
			rowObj[columnFields[1]] = '$' + ( summary[field] ).toLocaleString();
			rowObj[columnFields[2]] = Number( ( ( summary[field] * 1 / this.state.investedAmount *  1 ) * 100 ).toFixed(2) ) + '%';

			if( field === 'Health Care' ){
				rowObj[columnFields[3]] = '<= 12%';
			}else if( field === 'aAndBelow' ){
				rowObj[columnFields[3]] = '<= 30%';
			}else if( field !== 'Cash' ){
				rowObj[columnFields[3]] = '<= 20%';
			}else if( field === 'NY' ){
				rowObj[columnFields[3]] = '<= 20%';
			}else if( field === 'CA' ){
				rowObj[columnFields[3]] = '<= 20%';
			}
			if( rowObj[columnFields[1]] !== '$0' ){
				portfolioSummary.push( rowObj );
				rowObj = {};
			}
		})

		arrangedPortfolioSummary = portfolioSummary.map( ( obj, index ) => {
			let indexedObj = {};
			let startIndex = 4;
			const arrLen = portfolioSummary.length - 1;
			indexedObj = Object.assign( obj, { index: index } );

			if( obj.portfolioSummary === 'NY' ){
				indexedObj = { id: 1, obj };
			}else if( obj.portfolioSummary === 'CA' ){
				indexedObj = { id: 2, obj };
			}else if( obj.portfolioSummary === 'Health Care' ){
				indexedObj = { id: 0, obj }
			}else if( obj.portfolioSummary === 'aAndBelow' ){
				indexedObj = { id: 3, obj }
			}else if( obj.portfolioSummary === 'Cash' ){
				indexedObj = { id: arrLen, obj }
			}else{
				indexedObj = { id: startIndex++, obj }
			}
			return indexedObj;
		})

		console.log('..................', arrangedPortfolioSummary);
		arrangedPortfolioSummary.sort( function(a, b){ return a.id - b.id } );
		return arrangedPortfolioSummary.map( obj => portfolioSummary[obj.obj.index] );
	}

	createColumns(){
		let columns = [];

		for( let i = 0; i < this.state.ytmLadder.length; i++ ){
			columns.push( { key: (this.state.ytmLadder[i]).toString(),
				name: ( this.state.ytmLadder[i] ), resizable: true } )
		}

		return columns;
	}

	createRows( objBuckets ){
		const buckets = Object.keys( objBuckets );
		const numBuckets = buckets.length;
		let lenBucket = [];
		let bucketsByRows = [];
		let maxBondsInBucket = 0;
		let rowsPerBond = 3;
		let bond = {};
		let row = {};
		let totalByBucket = {};
		let totalInBucket = 0;
		let bucketIndex = buckets[0];
		//console.log('.................', bucketIndex*1 + numBuckets);
		buckets.forEach( bucket => {
			//	for( let i = 0; i < numBuckets; i++ ){
					lenBucket.push( objBuckets[bucket].length );
			//	}

				for( let j = 0; j < objBuckets[bucket].length; j++ ){
					totalInBucket += objBuckets[bucket][j].investAmt;
				}
				totalByBucket[bucket] = '$' + totalInBucket.toLocaleString();
				totalInBucket = 0;
		})

		maxBondsInBucket = Math.max(...lenBucket);
		console.log('.....totalByBucket,maxBondInBucket, rowsPerBond, bucketIndex, numBuckets', totalByBucket,maxBondsInBucket, rowsPerBond, bucketIndex, numBuckets, objBuckets);
		for(let i = 0; i < maxBondsInBucket; i++){
			for(let j = 0; j < rowsPerBond; j++){
				for(let k = bucketIndex; k < numBuckets + bucketIndex*1; k++){

					bond = objBuckets[k][i];

					if( bond ){
						if( j === 0 ){
							if( bond.cusip === 'Cash' ){
								row[(k).toString()] = bond.cusip;
							}else{
								row[(k).toString()] = bond.cusip + ', ' + bond.coupon + '%, ' + bond.ytm + 'yr, ' + bond.state;
							}
						}else if( j === 1 ){
							if( bond.cusip === 'Cash' ){
								row[(k).toString()] = '$' + bond.investAmt.toLocaleString();

							}else{
								row[(k).toString()] = bond.sector + ', ' + bond.rating + ', ' + bond.price;
							}
						}else if( j === 2 && bond.cusip !== 'Cash' ){
							row[(k).toString()] = '$' + bond.investAmt.toLocaleString();
						}
					}

				}
				if( Object.keys( row ).length !== 0 ){
					bucketsByRows.push( row );
					row = {};
				}
			}
		}
		bucketsByRows.push( totalByBucket );
		return bucketsByRows;
	}

   render() {
 	// console.log('.....in App.js, this.state',this.state)
    const munis = [...this.state.munis];
    return (
      <div className="container-fluid">
        <Nav handleCashReducerChange = { this.handleCashReducerChange } handleMinAllocChange = { this.handleMinAllocChange } filterMaturity = { this.filterMaturity } setLadder = { this.setLadder }/>
          <div style={{ marginTop: '135px' }} className="row">

			{ this.state.bucketsByRows.length !== 0 ?
				<div className="col-sm-8">
					<BucketAllocation columns = { this.state.columns } bucketsByRows = { this.state.bucketsByRows }/>
					<BucketSummary portfolioSummary = { this.state.portfolioSummary } />
					<div>&nbsp;</div>
				</div>:
				<div className="col-sm-8">
			   		<BucketSummaryPlaceholder />
				</div> }

			<div className="col-sm-4">
				<Constraint />
				<MuniList munis={ munis }/>
			</div>


			<div>&nbsp;</div><div>&nbsp;</div>

		</div>
      </div>
    );
  }
}

export default App;
