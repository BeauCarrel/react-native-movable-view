import React, { Component } from 'react';
import { PanResponder, Animated } from 'react-native';
import PropTypes from 'prop-types';

export default class MovableView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pan: new Animated.ValueXY(),
      disabled: props.disabled,
      xOffset: 0,
      yOffset: 0,
    };

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => !this.state.disabled,
      onMoveShouldSetPanResponderCapture: () => !this.state.disabled,
      onPanResponderGrant: () => {
        this.state.pan.setOffset({ x: this.state.xOffset, y: this.state.yOffset });
        this.props.onDragStart();
      },
      onPanResponderMove:
        Animated.event([null, {
          dx: this.state.pan.x,
          dy: this.state.pan.y,
        }]),
      onPanResponderRelease: (e, gestureState) => {
        const xOffset = this.state.xOffset + gestureState.dx;
        const yOffset = this.state.yOffset + gestureState.dy;
        this.setState({ xOffset , yOffset });
        this.props.onDragEnd();

        if(this.props.snapPoints != null) {
            let x = gestureState.dx
            let y = gestureState.dy
            let closest = this.props.snapPoints.reduce(function(prev, curr) {

                let pa = x - prev.x;
                let pb = y - prev.y;
                let prevDist = Math.sqrt( pa*pa + pb*pb );

                let ca = x - curr.x;
                let cb = y - curr.y;
                let currDist = Math.sqrt( ca*ca + cb*cb );

                return (currDist < prevDist ? curr : prev);
          });

          console.log("Snapping to: ", closest)
          Animated.event([null, {
              dx: closest.x,
              dy: closest.y,
          }])
        }
      }
    });
  }

  componentWillMount() {
    if (typeof this.props.onMove === 'function')
      this.state.pan.addListener((values) => this.props.onMove(values));
  }

  componentWillUnmount() {
    this.state.pan.removeAllListeners();
  }

  changeDisableStatus = () => {
    this.state.disabled = !this.state.disabled
  };

  render() {
    return (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={[this.props.style, this.state.pan.getLayout()]}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}

MovableView.propTypes = {
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  onMove: PropTypes.func,
  disabled: PropTypes.bool,
  snapPoints: PropTypes.array
};

MovableView.defaultProps = {
  onDragStart: () => {},
  onDragEnd: () => {},
  disabled: false,
};
