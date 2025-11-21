import registerTask from '../../task';
import {NODE} from '../consts';

export default registerTask(NODE, "ping", () => (
    {tm: new Date().getTime()}
));