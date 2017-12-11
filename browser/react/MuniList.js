import React from 'react';
import { Link } from 'react-router-dom';

const MuniList = ({ munis }) => {
  const total = munis.length;
	console.log('....in muni list, muni', munis);

  return (
	<div className="panel panel-default"><b>Available Muni Bonds:&nbsp; <span className="badge badge-info"> { total }</span></b>
	<div>&nbsp;&nbsp;</div>
	<form>	
			<select className="form-control" multiple="multiple" style={{ minHeight: '65vh' }}>
						{ munis.map( ( muni, id ) => (
					<option key = { id } > { muni.cusip}; { muni.maturity }; { muni.coupon}; { muni.rating }; { muni.sector };</option>
				) ) }
				
			</select>
			
	</form>   
	</div>


  );
};

export default MuniList;
