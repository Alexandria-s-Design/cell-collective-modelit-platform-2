import React from 'react';
import PropType from 'prop-types';

import classNames from 'classnames';

import './style.scss';

/*
 * Add scrolling functionality with css to list of content ultilize browser built in
 * scroller
 */
class ScrollableNative extends React.Component {
  render() {
		const { height, width, children, className, horizontal, isOverview } = this.props;
		const style = {};
		if (height) style.height = height;
		if (width) style.width = width;

		if(!isOverview){
			if (horizontal) {
				style.overflowX = 'auto';
			} else {
				style.overflowY = 'auto';
			}
		}
		
    return (
      <div className={classNames("browser-scroller", className)} style={style}>
        {children}
      </div>
    );
  }
}

ScrollableNative.PropType = {
  height: PropType.string,
};

ScrollableNative.defaultProps = {
	height: '100%',
}

export default ScrollableNative;
