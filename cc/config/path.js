import path       from "path";
import { pardir } from "../util/system";

const PATH         = { };

PATH.BASE          = pardir(__filename, 2);

PATH.PUBLIC        = path.join(PATH.BASE, "public");
PATH.TEMPLATES     = path.join(PATH.BASE, "templates");
PATH.MODELS        = path.join(PATH.BASE, "models");

export default PATH;
