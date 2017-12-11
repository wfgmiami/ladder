
import React from 'react';

const Maturity = ( ) => {

	let yearsRange = [];
	for(let i = 1; i < 31; i++){
		yearsRange.push(i);
	}

	return (
		<div>
		  <div className="col-sm-6">
		  <b>Min Maturity</b>
		  <select className="form-control" name="minMaturity" >
			  { yearsRange.map( year => (
				<option key={ year } value={ year }>{ year } </option>
			  ))
			  }
		  </select>
		  </div>
		  <div className="col-sm-6">
		  <b>Max Maturity</b>
		  <select className="form-control" name="maxMaturity" >
			  { yearsRange.map( year => (
				<option key={ year*10 } value={ year }>{ year } </option>
			  ))
			  }
		  </select>
		  </div>
		</div>
		)
	}
export default Maturity 

