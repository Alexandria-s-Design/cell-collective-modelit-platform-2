import React, { useContext }  from 'react';
import { CCCourseContext} from '../../../../containers/Course/index';
import Carousel from "../../../../components/Carousel";
import Utils from '../../../../../app/utils';

const ModelCarousel = (props) => {
	const { dim: { parentWidth } } = useContext(CCCourseContext);
	const minWidth = 260;
	const items = Utils.range(Math.floor(parentWidth / minWidth), 1, 10);
	return (<div className={'grid cards row-' + items}>
		<Carousel {...props} slidesToScroll={items-1} slidesToShow={items}>{props.children}</Carousel>
	</div>)
}

export default ModelCarousel;