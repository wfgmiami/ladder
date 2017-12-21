import React from 'react';


class MaturitySlider extends React.Component{
	constructor(){
		super();
		this.state = {
			min: {},
			max: {},
			inputMin: {},
			inputMax: {},
			spanMin: {},
			spanMax: {}
		}
	
	}

	componentDidMount(){
		const inputMin = this.inputMin;
		const inputMax = this.inputMax;
		const spanMin = this.spanMin;
		const spanMax = this.spanMax;

		this.setState( { inputMin });
		this.setState( { inputMax });
		this.setState( { spanMin });
		this.setState( { spanMax });

	}

	onMinChange(ev){
		this.setState( { min: ev.target.value * 1 } );
	}

	onMaxChange(ev){
		this.setState( { max: ev.target.value * 1 } );
	}

	onMaturity(ev){
	
		if( this.state.min > this.state.max){
			alert('Max maturity must be greater or equal to min maturity');
		}else{
			const filter = { min: this.state.min, max: this.state.max };
			ev.preventDefault();
		    this.props.filterMaturity( filter );

		}
		ev.preventDefault();
	}

	sliderChange(e){
		const investedAmount = e.target.value;
		this.setState({ investedAmount })
//		console.log('this.......', this,e, e.target.value)
	}

	render(){
		return(
			<div>
				<div style={{ float:'left' }}>	
					<p><b>Minimum Maturity</b></p>
					<span  ref = { span => this.spanMin = span } className="range-slider__value">8</span>
					<div>&nbsp;</div>
				</div>
				
				<div ref = { div => this.div = div } className="range-slider-double" >		
					<div> &nbsp;</div><div>&nbsp;</div>
					<input onInput={ (e) => this.sliderChange(e) } ref = { inputMin => this.inputRange = inputMin } className="range-slider-double__range" type="range" value='1' min="1" max="50" step="1"/>		
					<input onInput={ (e) => this.sliderChange(e) } ref = { inputMax => this.inputRange = inputMax } className="range-slider-double__range" type="range" value='5' min="1" max="50" step="1"/>		

				</div>

				<div style={{ marginLeft: '10px', float:'left' }}>	
					<p><b>Maximum Maturity</b></p>
					<span  ref = { span => this.spanMax = span } className="range-slider-max__value">8</span>
					<div> &nbsp;</div>
				</div>
							

				<br style={{ clear: 'both' }}/>
				<div>&nbsp;</div>
			</div>	
			
		)
	}

}

export default MaturitySlider;
