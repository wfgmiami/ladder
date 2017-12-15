import React from 'react';

class BucketSummary extends React.Component{
	constructor(props){
		super(props);
	}

	render(){
console.log('.......',this.props);
	const sectors = Object.keys(this.props.allocSector);
	const aAndBelow = this.props.allocRating.aAndBelow;
	const aAndLow = 'A rated & below';
		return(
			<div>
			  <table>
				<thead>
					<tr>
						<th className="size">Portfolio Summary</th>
						<th className="size">Rule</th>	
						
					</tr>
				</thead>
			  </table>
			
			  <div style={{ maxHeight:'60vh', overflowY:'auto' }}>
			
			  <table>
				<tbody>
					<tr><td>{ aAndLow }, ${ aAndBelow.toLocaleString() }, { (aAndBelow/this.props.investedAmt*100).toFixed(2)*1 }%</td><td>{'<= 30%'}</td></tr>

					{ sectors.map( ( sector, id )  => (
						<tr key = { id }>
							<td>{ sector }, ${ this.props.allocSector[sector].toLocaleString()}, { (this.props.allocSector[sector]/this.props.investedAmt*100).toFixed(2)*1 }%</td>
							<td>{ sector == 'Health Care' ? '<= 12%' : '<= 20%' }</td>
						</tr>	
					))}
			   </tbody>
			  </table>
			
			  </div>

	  		</div>
		)
	}
}

export default BucketSummary;
