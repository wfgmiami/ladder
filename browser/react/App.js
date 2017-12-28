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
import muniList from '../../muni-list.json';
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
			ranking: ['HealthCare', 'nyMunis', 'caMunis', 'aRated', 'aaRated', 'couponRated']
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
  }

  componentDidMount() {	
	this.setState({ munis: muniList } );
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
			let nyMunis = munis.filter( muni => muni.state == 'NJ' );
			let caMunis = munis.filter( muni => muni.state == 'CA' );
			let aRated = munis.filter( muni => muni.rating == 'A' )
								.concat( munis.filter( muni => muni.rating == 'A+') )
								.concat( munis.filter( muni => muni.rating == 'A-' ))
								.concat( munis.filter( muni => muni.rating.slice(0,2) == 'A/' ));

			let aaRated = munis.filter( muni => muni.rating.slice(0,2) == 'AA' );
			let couponRated = munis.sort( ( a,b ) => b.coupon - a.coupon );
			rankedMunis[bucket]=[{ 'HealthCare': healthCareMunis, 'nyMunis': nyMunis, 'caMunis': caMunis, 'aRated': aRated, 'aaRated': aaRated, 'couponRated': couponRated }];

		})
//	console.log('after....',rankedMunis);

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

				rankedMuniList[bucket] = { 'HealthCare': rankedMunis[bucket][0]['HealthCare'], 'nyMunis': nyPruned[bucket], 'caMunis': caPruned[bucket], 'aRated': aRatedPruned[bucket], 'aaRated': aaRatedPruned[bucket], 'couponRated': couponPruned[bucket] };
				tempObj = {};
		})
		ladderBuckets.forEach( bucket => {
			Object.keys( rankedMuniList[bucket] ).forEach( rank => {
				selectedMunis = rankedMuniList[bucket][rank].map( function( muni, id ) { return { id: id, dt: new Date( muni.lastTraded ).getTime(), muni: muni } } )
							.sort( ( a,b ) => b.dt - a.dt )
							.map( muni => rankedMuniList[bucket][rank][muni.id] );

				sortedByTrade[rank] = selectedMunis;
				sortedByTradeMunis[bucket] = sortedByTrade;
			})
		
		})
		
//	 	console.log('........rankedMuniList', sortedByTradeMunis);
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
		const minIncrement = this.state.minIncrement;
		const allocatedAmount = argsObj.allocatedAmount;
		const args = [].slice.call( arguments );
		const bucketMoney = argsObj.bucketMoney;
		const maxAandBelow = this.state.maxRating * investedAmount;
		// checkBondLimitSize increases currentBondIndex, so to get the current must - 1
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
		let currBucketIdx = 0;
	//		console.log('Allocate - currentBondIndex ---', currentBondIndex)
		if( args.length > 1 ){

			const availableBuckets = argsObj.buckets;//Object.keys(allocatedData);
			const availableBucketsLen = argsObj.buckets.length - 1;
			chosenBond['investAmt'] = allocatedAmount;

			allocBucket[bucket] ? allocBucket[bucket] += allocatedAmount
			: allocBucket[bucket] = allocatedAmount;

			allocatedData[bucket] ? allocatedData[bucket].push( chosenBond )
			: allocatedData[bucket] = [chosenBond];
//			console.log('Allocate -- allocateData[bucket], chosenBond', allocatedData[bucket].length, chosenBond);

			if(	chosenBond.cusip !== 'Cash' ){
				allocSector[sector] ? allocSector[sector] += allocatedAmount
				: allocSector[sector] = allocatedAmount;
			}else{
				// console.log('allocate cusip is cash bucket, chosenBond, allocSector ---', bucket, chosenBond, allocSector)
			}

			let allocatedDataLength = allocatedData[bucket].length - 1;

			if( rating.slice(0,2) !== 'AA' ){
				allocRating['aAndBelow'] ? allocRating['aAndBelow'] += allocatedAmount
				: allocRating['aAndBelow'] = allocatedAmount
			}
if(state == 'NY' || state=='CA') debugger;
			if( state == 'NY' ){
				allocState['NY'] ? allocState['NY'] += allocatedAmount
				: allocState['NY'] = allocatedAmount
			}else if( state == 'CA' ){
				allocState['CA'] ? allocState['CA'] += allocatedAmount
				: allocState['CA'] = allocatedAmount
			}

				if( sector === 'Health Care' && allocSector[sector] > maxHealthCare ){
 debugger;
				allocSector[sector] -= allocatedAmount;
				allocBucket[bucket] -= allocatedAmount;
				argsObj.currentBucketState.amountAllocated -= allocatedAmount;
				chosenBond['investAmt'] -= allocatedAmount;
				if( rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] -= allocatedAmount;
				if( state === 'NY' ) allocState['NY'] -= allocatedAmount;
				if( state === 'CA' ) allocState['CA'] -= allocatedAmount;

				allocatedData[bucket].splice( allocatedDataLength, 1 );
			//	console.log('Allocate health care allocated data after splice - allocatedData', allocatedData);
				argsObj.bucketControl['nextBucket'] = bucket;
				argsObj.currentBucketState.currentBondIndex--;

				currBucketIdx = availableBuckets.indexOf(bucket);
				if( bucket >= availableBuckets[availableBucketsLen]){
					previousBucket = availableBuckets[0];
				}else{
					previousBucket = availableBuckets[currBucketIdx + 1];
				}
				previousAllocatedBond = allocatedData[previousBucket]
				previousAllocatedBond = previousAllocatedBond[previousAllocatedBond.length - 1];
				minIncrementToAllocate = ( maxHealthCare - allocSector[sector] ) / ( minIncrement * ( previousAllocatedBond.price * 1 / 100 ) );

			//	console.log('1...............',currentBondIndex, checkBucket, bucket, argsObj, allocSector,allocBucket,allocatedData,bucketState)

				minIncrementToAllocate = Math.floor( minIncrementToAllocate ) * ( minIncrement * previousAllocatedBond.price * 1 / 100 );
				allocBucket[previousBucket] += minIncrementToAllocate;
				allocSector[sector] += minIncrementToAllocate;
//				bucketState[checkBucket]['investAmt'] += minIncrementToAllocate;

				// console.log('previous....', previousAllocatedBond[0],previousAllocatedBond[0].amountAllocated,minIncrementToAllocate)
				previousAllocatedBond['investAmt'] += minIncrementToAllocate;
				if( previousAllocatedBond.rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] += minIncrementToAllocate;

				bucketState.bucketStateKeys.forEach( bucket => {
					bucketState[bucket].currentRankIndex === 0 ? bucketState[bucket].currentRankIndex++ : null;
					bucketState[bucket].currentBondIndex = 0;
				})
//				console.log('after Health Care HIT.......................', currentBondIndex, bucket, argsObj, allocSector,allocBucket,allocatedData,bucketState)

			}else if( allocSector[sector] > maxSector ){
				debugger;
				//previousBucket = bucket;
				allocSector[sector] -= allocatedAmount;
				allocBucket[bucket] -= allocatedAmount;
				argsObj.currentBucketState.amountAllocated -= allocatedAmount;
				chosenBond['investAmt'] -= allocatedAmount;
				if( rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] -= allocatedAmount;

				allocatedData[bucket].splice( allocatedDataLength, 1 );
				//	console.log('Allocate sector allocated data after splice - allocatedData', allocatedData);
				allocatedDataLength = allocatedData[bucket].length - 1;
				currBucketIdx = availableBuckets.indexOf(bucket);
				let lastBucket = availableBuckets[availableBucketsLen];

				checkBucket = availableBuckets[currBucketIdx];

				if( allocatedDataLength < 0 ){
					if( checkBucket > lastBucket ){
						checkBucket = availableBuckets[0];
						currBucketIdx = 0;
						allocatedDataLength = allocatedData[checkBucket].length - 1;
					}else{
						checkBucket = availableBuckets[++currBucketIdx];
						allocatedDataLength = allocatedData[checkBucket].length - 1;
					}
					if ( argsObj.bucketControl['nextBucket'] === null ) argsObj.bucketControl['nextBucket'] = bucket;
				}

				checkSector = allocatedData[checkBucket][allocatedDataLength].sector;
				let checkedAll = false;
//debugger;

				while( checkSector !== sector && !checkedAll ){

					if( !allocatedDataLength ){
						if ( argsObj.bucketControl['nextBucket'] === null ) argsObj.bucketControl['nextBucket'] = bucket;

						if( ++checkBucket > lastBucket ){
							checkBucket = availableBuckets[0];
							currBucketIdx = 0;
							allocatedDataLength = allocatedData[checkBucket].length - 1;
						}else{
							checkBucket = availableBuckets[++currBucketIdx];
							allocatedDataLength = allocatedData[checkBucket].length - 1;

						}
					}else{
						allocatedDataLength--;
					}

					checkSector = allocatedData[checkBucket][allocatedDataLength].sector;
					if( checkBucket === bucket ) checkedAll = true;
				}

				if( !checkedAll ){
					previousAllocatedBond = allocatedData[checkBucket];
					minIncrementToAllocate = ( maxSector - allocSector[sector] ) / ( minIncrement * ( previousAllocatedBond[allocatedDataLength].price * 1 / 100 ) );

					minIncrementToAllocate = Math.floor( minIncrementToAllocate ) * ( minIncrement * previousAllocatedBond[allocatedDataLength].price * 1 / 100 );

					allocBucket[checkBucket] += minIncrementToAllocate;
					allocSector[sector] += minIncrementToAllocate;

					previousAllocatedBond[allocatedDataLength]['investAmt'] += minIncrementToAllocate;
					if( previousAllocatedBond[allocatedDataLength].rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] += minIncrementToAllocate;
				}

			}else if( allocRating['aAndBelow'] >= maxAandBelow ){
//debugger;
				allocSector[sector] -= allocatedAmount;
				allocBucket[bucket] -= allocatedAmount;
				argsObj.currentBucketState.amountAllocated -= allocatedAmount;
				chosenBond['investAmt'] -= allocatedAmount;
				allocRating['aAndBelow'] -= allocatedAmount;
				allocatedData[bucket].splice( allocatedDataLength, 1 );
			
				allocatedDataLength = allocatedData[bucket].length - 1;
				currBucketIdx = availableBuckets.indexOf(bucket);
				let lastBucket = availableBuckets[availableBucketsLen];

				checkBucket = availableBuckets[currBucketIdx];

				if( allocatedDataLength < 0 ){
					if( checkBucket > lastBucket ){
						checkBucket = availableBuckets[0];
						currBucketIdx = 0;
						allocatedDataLength = allocatedData[checkBucket].length - 1;
					}else{
						checkBucket = availableBuckets[++currBucketIdx];
						allocatedDataLength = allocatedData[checkBucket].length - 1;
					}
					if ( argsObj.bucketControl['nextBucket'] === null ) argsObj.bucketControl['nextBucket'] = bucket;
				}

				let checkRating = allocatedData[checkBucket][allocatedDataLength].rating;
				let checkedAll = false;

				while( checkRating.slice(0,2) !== rating.slice(0,2) && !checkedAll ){

					if( !allocatedDataLength ){
						if ( argsObj.bucketControl['nextBucket'] === null ) argsObj.bucketControl['nextBucket'] = bucket;

						if( ++checkBucket > lastBucket ){
							checkBucket = availableBuckets[0];
							currBucketIdx = 0;
							allocatedDataLength = allocatedData[checkBucket].length - 1;
						}else{
							checkBucket = availableBuckets[++currBucketIdx];
							allocatedDataLength = allocatedData[checkBucket].length - 1;
						}
					}else{
						allocatedDataLength--;
					}

					checkRating = allocatedData[checkBucket][allocatedDataLength].rating;
					if( checkBucket === bucket ) checkedAll = true;
				}

				if( !checkedAll ){
					previousAllocatedBond = allocatedData[checkBucket];
					minIncrementToAllocate = ( maxAandBelow - allocRating['aAndBelow'] ) / ( minIncrement * ( previousAllocatedBond[allocatedDataLength].price * 1 / 100 ) );

					minIncrementToAllocate = Math.floor( minIncrementToAllocate ) * ( minIncrement * previousAllocatedBond[allocatedDataLength].price * 1 / 100 );

					allocBucket[checkBucket] += minIncrementToAllocate;
					allocSector[sector] += minIncrementToAllocate;

					previousAllocatedBond[allocatedDataLength]['investAmt'] += minIncrementToAllocate;
					allocRating['aAndBelow'] += minIncrementToAllocate;
				}

				
				bucketState.bucketStateKeys.forEach( bucket => {
					bucketState[bucket].currentRankIndex++;
					bucketState[bucket].currentBondIndex = 0;
				})
			}

			if( allocBucket[bucket] >= bucketMoney ){
				//debugger;
				allocSector[sector] -= allocatedAmount;

				allocBucket[bucket] -= allocatedAmount;
				argsObj.currentBucketState.amountAllocated -= allocatedAmount;
				chosenBond['investAmt'] -= allocatedAmount;
				if( rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] -= allocatedAmount;
				// look to allocate 5000 to the previously allocated bond - should have at least one bond
				// already allocated, otherwise it cannot > bucket money
				idx = allocatedData[bucket].length - 2;
				previousAllocatedBond = allocatedData[bucket][idx];

				sectorLimitCheck = allocSector[previousAllocatedBond.sector]

				minIncrementToAllocate = ( bucketMoney - allocBucket[bucket] ) / ( minIncrement * ( previousAllocatedBond.price * 1 / 100 ) );

				minIncrementToAllocate = Math.floor( minIncrementToAllocate ) * ( minIncrement * previousAllocatedBond.price * 1 / 100 );

				sectorLimitCheck += minIncrementToAllocate;
//				console.log('Bucket > limit checking previous bond sector --- prevAllocBond, idx, bucket, allocData[bucket]', previousAllocatedBond, idx, bucket, allocatedData[bucket]);

				if( ( previousAllocatedBond.sector === 'Health Care' && sectorLimitCheck >= maxHealthCare )
				|| ( sectorLimitCheck >= maxSector ) ){


					allocateToCash = bucketMoney - allocBucket[bucket];

					chosenBond['cusip'] = 'Cash';
					chosenBond['investAmt'] = allocateToCash;
					allocSector['Cash'] += allocateToCash;
					allocBucket[bucket] += minIncrementToAllocate;
					bucketState[bucket]['investAmt'] += minIncrementToAllocate;

//					console.log('........BUCKET HIT SECTORS LIMIT....', chosenBond);

				}else{

					// console.log('........min.....', currentBondIndex,allocatedData[bucket],bucketMoney - allocBucket[bucket], minIncrementToAllocate, allocatedData[bucket][currentBondIndex], allocatedData[bucket],previousAllocatedBond.price)

					allocBucket[bucket] += minIncrementToAllocate;
					allocSector[sector] += minIncrementToAllocate;
//					bucketState[bucket]['investAmt'] += minIncrementToAllocate;

					// console.log('previous....', previousAllocatedBond[0],previousAllocatedBond[0].amountAllocated,minIncrementToAllocate)
					previousAllocatedBond['investAmt'] += minIncrementToAllocate;
					if( previousAllocatedBond.rating.slice(0,2) !== 'AA' ) allocRating['aAndBelow'] += minIncrementToAllocate;

					allocateToCash = bucketMoney - allocBucket[bucket];
					chosenBond['cusip'] = 'Cash';
					chosenBond['investAmt'] = allocateToCash;
					allocSector['Cash'] += allocateToCash;
//					console.log('BUCKETS HIT.........', bucketMoney, minIncrementToAllocate,bucket,bucketState,chosenBond, allocatedData, argsObj.currentBucketState, allocBucket, currentBondIndex, allocBucket[bucket],bucketMoney, previousAllocatedBond);



				}
				idx = argsObj.buckets.indexOf( bucket );
				argsObj.buckets.splice( idx, 1 );
//				console.log('splicing.......in allocation sub', bucket, idx, argsObj.buckets);
				// numBuckets = buckets.length;
				// if( numBuckets != 0 ){
				// 	bucket--;
				// }

			}


		}else{
			argsObj.currentBucketState.amountAllocated += allocatedAmount;
			// if( argsObj.bucket === '37' ) console.log('A..............37........',allocatedAmount, argsObj)

			argsObj.currentBucketState.allocSector[sector] ? argsObj.currentBucketState.allocSector[sector] += allocatedAmount
			:argsObj.currentBucketState.allocSector[sector] = allocatedAmount

			argsObj.currentBucketState.allocRating[rating] ? argsObj.currentBucketState.allocRating[rating] += allocatedAmount
			:argsObj.currentBucketState.allocRating[rating] = allocatedAmount
		}

	}

	lookForBondInDiffRanking( argsObj ){
		const muniData = argsObj.muniBondInBucket;
		const ranking = this.state.ranking;
		const bucketMoney = argsObj.bucketMoney;
		const bucket = argsObj.bucket;
		let currentRankIndex = argsObj.currentBucketState.currentRankIndex;
		let amountAllocated = argsObj.currentBucketState.amountAllocated;
		let filled = argsObj.currentBucketState.filled;
		// let bucketStateKeys = argsObj.bucketState.bucketStateKeys;
		let chosenBond = argsObj.chosenBond;
		let idx = 0;

		let currentBondIndex = 0;

		while( !chosenBond && currentRankIndex < ranking.length - 1 ){
			chosenBond = muniData[ranking[++currentRankIndex]][currentBondIndex];
			// console.log('.............chosenBond, currentRankIndex',muniData, currentRankIndex, currentBondIndex)
		}

		// no bond found to be allocated in the bucket
		if( !chosenBond ){
			// amountAllocated += bucketMoney - amountAllocated;
			// filled = true;
			// argsObj.chosenBond = null;
			// console.log('splicing.....rank=ranking.length: argsObj--', argsObj)
			return argsObj;
		}

		argsObj.chosenBond = chosenBond;
		argsObj.currentBucketState.currentRankIndex = currentRankIndex;
		argsObj.currentBucketState.currentBondIndex = currentBondIndex;

		return argsObj;

	}


	checkBondForLimitSize( argsObj ){
		let chosenBond = argsObj.chosenBond;
		let currentBondIndex = argsObj.currentBondIndex;
		let allocatedAmount = 0;
		let sector = chosenBond.sector;
		let rating = chosenBond.rating;
		const price = chosenBond.price;
		const minAllocBond = this.state.minAllocBond;
		const maxPercBond = this.state.maxPercBond;
		const investedAmount = this.state.investedAmount;

		// check if min alloc is > 10%. If so, continue checking for all bonds in the bucket per given rank rule
		// debugger;
		if( minAllocBond * price / 100 > maxPercBond * investedAmount ){  // 25 000 * price > 10% * Invested Amount
			// 25 000 * price < bucket money
			// !!!!!!!!!!!!!!!!!!!!!before switching ranking keep checking with the rest of the bonds
			argsObj = this.lookForBondInDiffRanking( argsObj )
			console.log('Limit size - minAlloc*price > max perc * inv amt - chosen bond---', argsObj)
			return argsObj;
		}else if ( minAllocBond * price / 100 > argsObj.bucketMoney ) {
			alert('The minimum allocation exceeds the money assigned to the bucket!');
			argsObj.chosenBond = null;
			return argsObj;
		}else{
			// console.log('.....bond in limit size, chosen bond---', chosenBond)

			allocatedAmount = Number((minAllocBond * price / 100).toFixed(2));
			argsObj.allocatedAmount = allocatedAmount;
			console.log('Limit size before calling allocatedData- will update currentBucketState allocRating, allocSector, amtAlloc-  argsObj----', argsObj);
			this.allocateData( argsObj );

			argsObj.currentBucketState.currentBondIndex++;
			// bond index increased and then generateLadder will call allocate data again
			return argsObj;
		}

	}

  generateLadder( bucketsObj ){

		let cnt = 0;
		let idx = 0;
		// let allocCash = 0;
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
		let bucketControl = { nextBucket: null };
		const allocatedData = {};

		const ranking = this.state.ranking;
		const muniData = this.state.rankedMuniList;
		const investedAmount = this.state.investedAmount;
		let bucketState = Object.assign({}, bucketsObj);


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
//debugger;
		currentRankIndex = bucketState[bucket]['currentRankIndex'];
		currentBondIndex = bucketState[bucket]['currentBondIndex'];
		chosenBond = muniData[bucket][ranking[currentRankIndex]][currentBondIndex];
		console.log("Start Of Loop - bucket, buckets, bucketIdx, bondIdx, rankIdx----", bucket, buckets, bucketIndex, currentBondIndex, currentRankIndex)

		argsObj = { muniBondInBucket: muniData[bucket], bucket, bucketMoney, currentBucketState: bucketState[bucket],  bucketState, chosenBond, bucketControl, buckets };

		if( !chosenBond ){
			argsObj = this.lookForBondInDiffRanking( argsObj )
			chosenBond = argsObj.chosenBond;

			if( chosenBond ){
				argsObj = this.checkBondForLimitSize( argsObj );
				console.log('chosenBond from diff ranking after look for Bond In Diff Ranking', argsObj.chosenBond)
				this.allocateData( argsObj, allocatedData, allocBucket, allocSector, allocRating, allocState, bucketState, bucket )
				//console.log("generateLadder after .......COMING FROM HEALTH CARE......bucket", bucket)
			}else{
				// bucketsToRemove[bucket] = bucket;
				chosenBond = {};
				chosenBond['cusip'] = 'Cash';
				chosenBond['investAmt'] = bucketMoney;
				allocSector['Cash'] += bucketMoney;

				if( allocBucket[bucket] ){
					chosenBond['investAmt'] -= allocBucket[bucket];
					allocSector['Cash'] -= allocBucket[bucket];
				}

				if( allocatedData[bucket] ) allocatedData[bucket].push( chosenBond )
				else allocatedData[bucket] = chosenBond;
				idx = buckets.indexOf( bucket );
				buckets.splice( idx, 1 );

			//	console.log('splicing.......in main sub- bucket, idx, buckets, bucketIdx, chosenBond --- ', bucket, idx, buckets, bucketIndex, chosenBond);
			}

		}else{
			argsObj = this.checkBondForLimitSize( argsObj );
			if( !argsObj.chosenBond ){
				// bucketState.bucketStateKeys = argsObj.bucketState.bucketStateKeys;
				chosenBond = {};
				chosenBond['cusip'] = 'Cash';
				chosenBond['investAmt'] = bucketMoney;
				allocSector['Cash'] += bucketMoney;
				if( allocatedData[bucket] ) allocatedData[bucket].push( chosenBond )
				else allocatedData[bucket] = chosenBond;
				idx = buckets.indexOf( bucket );
				buckets.splice( idx, 1 );
			}else{
				if( argsObj.currentBucketState.currentRankIndex !== bucketState[bucket].currentRankIndex ){
					bucketState[bucket].currentRankIndex = argsObj.currentBucketState.currentRankIndex;
				}
				this.allocateData( argsObj, allocatedData, allocBucket, allocSector, allocRating, allocState, bucketState, bucket )
				// if( argsObj.bucket === '37' ) console.log('....................37........', allocBucket[bucket], argsObj)
			}

			console.log('Return from limit check bound found in Rank - bucket, argsObj, bucketState, allocBucket, allocSector, allocRating, allocatedData---', bucket, argsObj, bucketState, allocBucket, allocSector, allocRating, allocatedData)
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

		// arrBucketsToRemove = Object.keys( bucketsToRemove );

		// if( arrBucketsToRemove.length > 0 ){
		// 	let newBucketsList = [];
		// 	newBucketsList = bucketState.bucketStateKeys.filter( bucket => !(bucket in bucketsToRemove) );
		// 	// console.log('new................', temp)
		// 	bucketState.bucketStateKeys = newBucketsList;
		// 	bucketsToRemove = {};
		// }

	//cnt++
		//numBuckets > 0
	}while( numBuckets > 0 )

	const fields = Object.keys( allocRating );

	fields.forEach( field => {
		allocSector[field] = allocRating[field];
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

	createSummary( summary ){
		let fields = Object.keys( summary );
		let portfolioSummary = [];
		let rowObj = {};
		let arrangedPortfolioSummary = [];
		const columnFields = [ 'portfolioSummary', 'dollarAllocated', 'percentageAllocated', 'rule' ];

		// console.log('.............summary', summary, this.state);
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
			}
			if( rowObj[columnFields[1]] !== '$0' ){
				portfolioSummary.push( rowObj );
				rowObj = {};
			}
		})

		arrangedPortfolioSummary = portfolioSummary.filter( obj => obj.portfolioSummary !== 'Cash' ).concat( portfolioSummary.filter ( obj => obj.portfolioSummary == 'Cash' ) );

		return arrangedPortfolioSummary;
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
				for( let i = 0; i < numBuckets; i++ ){
					lenBucket.push( objBuckets[bucket].length );
				}

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
								row[(k).toString()] = bond.cusip + ', ' + bond.coupon + '%, ' + bond.ytm + 'yr';
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
        <Nav filterMaturity = { this.filterMaturity } setLadder = { this.setLadder }/>
          <div style={{ marginTop: '105px' }} className="row">

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
