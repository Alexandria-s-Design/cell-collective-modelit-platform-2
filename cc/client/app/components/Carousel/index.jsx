import React from 'react';
import { connect } from 'react-redux';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import './styles.scss';
class Carousel extends React.Component {
  get defaultSettings() {
    const settings = {};
    settings.dots = false;
    settings.infinite = false;
    settings.speed = 500;
    settings.slidesToShow = 7;
    settings.slidesToScroll = 1;
    settings.arrows = true;
    settings.className = 'slides';
    return settings;
  }

  render() {
    const { props } = this;

    return (
      <Slider {...this.defaultSettings} {...props}>
        {props.children}
      </Slider>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Carousel);
