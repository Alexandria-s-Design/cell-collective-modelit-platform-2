import React from 'react';

export default class Spinner extends React.Component{
  constructor(){
    super();
    this.state = {t: false};
  }
  UNSAFE_componentWillMount(){
    this._timer = window.setInterval(e=>{
                      this.setState((s) => ({t: !s.t}));
                    },500);
  }
  componentWillUnmount(){
    if(this._timer){
      window.clearInterval(this._timer);
      this._timer = undefined;
    }
  }
  render(){
    const text = this.state.t ? '/' : '\\';
    return (<span className={this.props.className}>{this.props.before}{text}{this.props.after}</span>);
  }
}
