import React from 'react';

const FixedAmount = ( { onFixedAmount }) => (
  <td className="item">
    <input type="number" step="1" className="form-control" onChange={ onFixedAmount } ></input>
  </td>
)

export default FixedAmount;
