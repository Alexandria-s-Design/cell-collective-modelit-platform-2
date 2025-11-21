import { Seq } from 'immutable';
import Utils from '../utils'

const e = (parent) => class extends parent{
    static defaultProps = {
        ...parent.defaultProps,
        offset: 8,
        min: 0,
        max: 100,
        step: 1,
        from: e => e,
        to: e => e
    }
    constructor(...args) {
        super(...args);
        this.state = Seq(this.state || {}).concat({ value: this.props.value }).toObject();
    }
    getValue(e) {
        const props = this.props;
        const v = props.min + (props.max - props.min) * props.from(Utils.range(e, 0, 1));
        return v - v % props.step;
    }
    getClickValue(e) {
        const offset = this.props.offset;
        const rect = this.refs.track.getBoundingClientRect();
        return this.getValue((e.clientX - rect.left - offset) / (rect.right - rect.left - 2*offset));
    }
    getDragValue(v, e) {
        const props = this.props;
        const sx = 1 / e.target.parentElement.offsetWidth;
        const dx = e.clientX - props.to((v - props.min) / (props.max - props.min)) / sx;
        return e => this.getValue(sx * (e.clientX - dx));
    }
    UNSAFE_componentWillReceiveProps(props) {
        !this.state.editing && this.setState({ value: props.value });
    }
};

e.linear = o => {
    let p = {};
    const ranges = Seq(o).sortBy((v, k) => +k).map((v, k) => ({ sc: (v - p.y) / (k - p.x), min: p, max: p = { x: +k, y: v } })).toList().delete(0);
    const min = ranges.first().min.y;
    const max = ranges.last().max.y;

    return {
        from: v => {
            const e = ranges.find(e => v >= e.min.x && v <= e.max.x);
            return (e.min.y + e.sc * (v - e.min.x)) / max;
        },
        to: v => {
            v = v * (max - min) + min;
            const e = ranges.find(e => v >= e.min.y && v <= e.max.y);
            return e.min.x + (v - e.min.y) / e.sc;
        }
    }
};

export default e;