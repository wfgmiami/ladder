import React from 'react';
import cx from 'classnames';
import blacklist from 'blacklist';
import PropTypes from 'prop-types';


class AmountSlider extends React.Component {
	static propTypes = {
		axis: PropTypes.string,
		x: PropTypes.number,
		xmax: PropTypes.number,
		xmin: PropTypes.number,
		y: PropTypes.number,
		ymax: PropTypes.number,
		ymin: PropTypes.number,
		xstep: PropTypes.number,
		ystep: PropTypes.number
	}

	static defaultProps = {
		axis: x,
		xmin: 250000,
		ymin: 0,
		ymax: 0,
		xstep: 1000,
		ystep: 0
	}	


	render(){
		const { axis } = this.props;

		const props = blacklist(
			this.props,
			'x',
			'y',
			'xmin',
			'xmax',
			'ymin',
			'ymax',
			'xstep',
			'ystep',
			'onChange',
			'onDragEnd',
			'className',
			'onClick'
		);

		const pos = this.getPosition();
		getPosition = () => {
			let top = 0;
			let left = ( this.props.x - this.props.xmin ) /
				( this.props.xmax - this.props.xmin ) * 100;
			if ( left > 100 ) left = 100;
			if ( left < 0 ) left = 0;
			left += '%';
			return { top, left };
		}

		const valueStyle = {};
		valueStyle.width = pos.left;
		props.className = cx( 'u-slider', `u-slider-${axis}`, this.props.className );

		return(
	    
		)

	}

}

export default AmountSlider;
