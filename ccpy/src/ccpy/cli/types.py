# imports - standard imports
import os.path as osp

def Path(parser,
    exists      = False,
    file_ok     = True,
    dir_ok      = True,
    readable    = True,
    writable    = False
):
    def fn(arg):
        arg = osp.abspath(arg)

        if exists:
            if not osp.exists(arg):
                parser.error("Path %s does not exist." % arg)
            
            if not file_ok and not dir_ok:
                parser.error("Path %s must either be a directory or a file." % arg)
            else:
                if file_ok:
                    if not osp.isfile(arg):
                        parser.error("Path %s is not a file." % arg)

                if dir_ok:
                    if not osp.isdir(arg):
                        parser.error("Path %s is a directory." % arg)
        
        return arg

    return fn