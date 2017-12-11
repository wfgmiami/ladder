import React from 'react';
import { Link } from 'react-router-dom';

const BondList = ({ bonds, searchFlag, reset }) => {
  const total = bonds.length;


  return (
	<div className="panel panel-default"><b>Available Bonds:&nbsp; <span className="badge badge-info"> { total }</span></b>
	<div>&nbsp;&nbsp;</div>
	<form>	
			<select className="form-control" multiple="multiple" style={{ minHeight: '65vh' }}>
						{ bonds.map( ( bond, id ) => (
					<option key = { id } value = { bond.name }> { bond.name }; { bond.maturity } yrs; { bond.industry }; { bond.state }</option>
				) ) }
				
			</select>
			
	</form>   
	</div>


  );
};

export default BondList;
