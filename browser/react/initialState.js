const initialState = {
  msgs: [],
  transactions: [],
  quote: [],
  search: '',
  allocationPercents: [1, 5, 10, 20],
  selectedAllocation: [],
  bonds: [{ name: 'ME Hlth & Higher Ed - MaineGeneral Hlth', industry:'Health care', state:'ME',maturity:10 }, { name: 'MD Hlth & Higher Ed - Mercy Medical Center', industry:'Health care', state:'MD', maturity:5 }, { name: 'Metropolitan Boston Transit Parking Corp',industry:'Transportation', state: 'MT', maturity:13 }, { name: 'NY Transportation Dev Corp - LaGuardia Airport', industry:'Transportation', state:'NY', maturity:30 }, {name:'Gas Acq & Supply - Macquarie', industry:'Oil and Gas', state:'TX', maturity: 11 }, { name: 'New Jersey Transportation Trust Fund', industry:'Transportation', state:'NJ', maturity: 3 }, { name: 'NJ Health Care Facs - Hsp. Asset Trans Program', industry:'Health care', state:'NJ', maturity:8 } ,{ name: 'New Jersey State Turnpike Authority', industry:'Transportation', state: 'NJ', maturity: 20 } ]

};

export default initialState;
