import React from 'react';

const Constraint =() => {
	
return (
	<div>
	<table>
		<thead>
			<th className="size">Rules at Portfolio Level</th>
		</thead>
		<tbody>
			<tr>
				<td className="">
					20% max per sector / 12% for health care	
				</td>
			</tr>		
			<tr>	
				<td>
					30% max A+ and below rated bonds
				</td>
			</tr>
		</tbody>
	</table>

	<table>	
		<thead>
			<th className="size">Rules at Bucket / Bond Level</th>
		</thead>

		<tbody>
			<tr>
				<td className="">
					10% max per bond	
				</td>	
			</tr>
			<tr>
				<td className="">
					25k min allocated 	
				</td>	
			</tr>
				<tr>
				<td className="">
					100k max allocated 	
				</td>	
			</tr>
			<tr>
				<td className="">
					5k min increment 	
				</td>	
			</tr>
			<tr>
				<td className="">
					all buckets equally weighted 	
				</td>	
			</tr>
		</tbody>

	</table>
	<table>	
		<thead>
			<th className="size">Ranking Rules at Bond Level</th>
		</thead>

		<tbody>
			<tr>
				<td className="">
					1. Health care sector	
				</td>	
			</tr>
			<tr>
				<td className="">
					2. A rated 	
				</td>	
			</tr>
				<tr>
				<td className="">
					3. AA or above rated 	
				</td>	
			</tr>
			<tr>
				<td className="">
					4. Higher coupon	
				</td>	
			</tr>
		</tbody>
	</table>


	</div>
  )		
}

export default Constraint;
