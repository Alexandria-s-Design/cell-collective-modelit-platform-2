import path from "path";
import axios from "axios";

const pardir        = (fname, level = 1) => {
    for (let i = 1 ; i <= level ; ++i) {
        fname = path.dirname(fname);
    }

    return fname;
};

export { pardir };