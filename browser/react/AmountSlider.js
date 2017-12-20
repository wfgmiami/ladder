import React from 'react';


class AmountSlider extends React.Component {
	constructor(){
		super();
		this.state = {
			input: {},
			div: {},
			span: {},
			sliderValue: 250000
		}
		this.sliderChange = this.sliderChange.bind(this);

	}

	componentDidMount(){
		const input = this.inputRange;
		const div = this.div;
		const span = this.span;

		this.setState( { input });
		this.setState( { div });
		this.setState( { span });

	}


	sliderChange(e){
		//const spanValue = this.state.span.previousElementSibling.getAttribute('value');
		//this.setState( { spanValue });
		const sliderValue = e.target.value;
		this.setState({ sliderValue })
		console.log('this.......', this,e, e.target.value)
	}

	render(){
		console.log('state......', this.state)
		return(
			<div>

				<div ref = { div => this.div = div } className="range-slider" >
					<input onInput={ (e) => this.sliderChange(e) } ref = { inputRange => this.inputRange = inputRange } className="range-slider__range" type="range" value={ this.state.sliderValue } min="250000" max="5000000" step="10000"/>

					<span ref = { span => this.span = span } className="range-slider__value">${ Number(this.state.sliderValue).toLocaleString() }</span>

				</div>
			</div>
		)

	}
}

export default AmountSlider;
