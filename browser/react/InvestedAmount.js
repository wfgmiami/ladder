import React from 'react';
import { Link } from 'react-router-dom';


class InvestedAmount extends React.Component{
	constructor( props ){
		super( props );

		this.state = {
			investedAmount: 1000000
		}
		this.onMoneyChange = this.onMoneyChange.bind(this);
		this.onGenerate = this.onGenerate.bind(this);
	}

	onMoneyChange(ev){
		this.setState({ investedAmount: ev.target.value });
	}
	
	onGenerate(ev){
		this.props.generateLadder(this.state.investedAmount);
		ev.preventDefault();
	}

	render(){
		return (
			<form>
			  <div className="form-group">
				<label>Invested</label><div><label>Amount</label></div>
				<input className="form-control" value = { this.state.investedAmount } onChange = { this.onMoneyChange }></input>
			  </div>
			<button className="btn btn-default" onClick = { this.onGenerate }>Generate Ladder</button>
   		  </form>



	   )
	}
}

export default InvestedAmount;
