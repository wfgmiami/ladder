import React from 'react';

class BucketAllocation extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			allocation: []
		}
	}
  
	render(){
		let lenBucket = [];
		let maxLen = 0;
		let totalByBucket = 0;
		let totalInBucket = [];
		let totalLines = [];

		const buckets = Object.keys(this.props.allocatedData);
		buckets.forEach(bucket => {
			for(let i = 0; i < buckets.length; i++){
				lenBucket.push(this.props.allocatedData[bucket].length);
			}

			for(let j = 0; j < this.props.allocatedData[bucket].length; j++){
				totalByBucket += this.props.allocatedData[bucket][j].investAmt;	
//				console.log(this.props.allocatedData[bucket][j].investAmt)
			}
			totalLines.push(<td>{ totalByBucket.toLocaleString() }</td>)	
			totalByBucket = 0;
		})

		totalInBucket.push(<tr key={ 0 }> { totalLines }</tr>);
		maxLen = Math.max(...lenBucket);

		let tblData = [];
		let rowLines = [];
		let dataLine;
		const tblName = "BUCKETS ALLOCATION";

		for(let row = 0; row < maxLen; row++){
			//	tblData.push('<tr>');

				buckets.forEach( bucket => {
					dataLine = this.props.allocatedData[bucket][row];
					if(dataLine){
						if( dataLine.cusip != 'Cash' ){
							rowLines.push(<td>{ dataLine.cusip }, {dataLine.coupon}%, {dataLine.ytm}yr
								<tr>{ dataLine.sector }, {''} { dataLine.rating }</tr>
								<tr>${ dataLine.investAmt.toLocaleString() }</tr>
								</td>)				
			   			}else{
							rowLines.push(<td>{ dataLine.cusip }
								<tr>${ dataLine.investAmt.toLocaleString() }</tr>
								</td>)	
						}			
						
					}else{
						rowLines.push(<td>{ '' }</td>)
					}					
				})
	
				tblData.push(<tr key={ row }>{ rowLines }</tr>);
				rowLines = [];
		}
		
		console.log('props in bucket allocation', totalInBucket, tblData, maxLen, buckets,this.props);
		return(
		<div>
		  <table style={{ width:"100%" }}>
 			<thead>
				<tr><td colSpan={ buckets.length } style={{ textAlign: 'center', color: 'yellow' }}>{ tblName }</td></tr>
				<tr>
				{ buckets.map( (bucket, id) => (
					<th key={ id } className='size' style={{ textAlign: 'center' }}>{ bucket }</th>
				))}
				</tr>
			</thead>
		  </table>
		  <div style={{ maxHeight:'60vh', overflowY:'auto' }}>
		  <table>
			<tbody>
				{ tblData }
			</tbody>
			<tfoot>
				{ totalInBucket }	
			</tfoot>
		  </table>
		  </div>
	  	</div>
	    )
	}
}

export default BucketAllocation;
