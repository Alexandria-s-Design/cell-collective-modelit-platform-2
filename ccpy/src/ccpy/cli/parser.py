# imports - standard imports
import sys
import os
import argparse
import multiprocessing as mp

# imports - module imports
from ccpy.__attr__     import (
    __name__,
    __version__,
    __description__,
    __command__
)
from ccpy.util.environ  import getenv
from ccpy.cli           import util as _cli
from ccpy.cli           import types
from ccpy.cli.formatter import ArgumentParserFormatter
from ccpy.cli.util      import _CAN_ANSI_FORMAT
from ccpy._pip          import _PIP_EXECUTABLES

_DESCRIPTION_JUMBOTRON = \
"""
%s (v %s)

%s
""" % (
    _cli.format(__name__,        _cli.RED),
    _cli.format(__version__,     _cli.BOLD),
    _cli.format(__description__, _cli.BOLD)
)

def get_parser():
    parser = argparse.ArgumentParser(
        prog            = __command__,
        description     = _DESCRIPTION_JUMBOTRON,
        add_help        = False,
        formatter_class = ArgumentParserFormatter
    )
    parser.add_argument("-a", "--action",
        choices     = ("read","analyse","test","parse"),
        help        = "Action to be performed.",
        required    = True,
        default     = getenv("ACTION", None)
    )
    parser.add_argument("-i", "--input",
        # type    = types.Path(parser, exists = True, dir_ok = False),
        default = getenv("INPUT_FILE"),
        help    = "Input File."
    )
    parser.add_argument("-t", "--input-type",
        choices     = ("sbml","json","yaml","matlab"),
        help        = "File Type.",
        # required    = True,
        default     = getenv("INPUT_TYPE", None)
    )
    parser.add_argument("--output-type",
        choices     = ("sbml","json","yaml","matlab"),
        help        = "File Type.",
        default     = getenv("OUTPUT_TYPE", "json")
    )
    parser.add_argument("-m", "--model-type",
        choices     = ("metabolic", "kinetic"),
        help        = "Model Type.",
        # required    = True,
        default     = getenv("MODEL_TYPE", None)
    )
    parser.add_argument("--analysis-type",
        choices     = ("fba","fva","pfba","gfba","gimme","imat","fcore","mcadre","init","drug","drug_solver"),
        help        = "Analysis Type.",
        # required    = True,
        default     = getenv("ANALYSIS_TYPE", None)
    )
    parser.add_argument("--parameters",
        help				= "Parameters"
    )
    parser.add_argument("-j", "--jobs",
        type    = int,
        help    = "Number of Jobs to be used.",
        default = getenv("JOBS", mp.cpu_count())
    )
    # parser.add_argument("-o", "--output",
    #     default = getenv("OUTPUT_FILE"),
    #     help    = "Print Output to File."
    # )
    parser.add_argument("--force",
        action  = "store_true",
        default = getenv("FORCE", False),
        help    = "Force search for files within a project."
    )

    if _CAN_ANSI_FORMAT or "pytest" in sys.modules:
        parser.add_argument("--no-color",
            action  = "store_true",
            default = getenv("NO_COLOR", False),
            help    = "Avoid colored output."
        )

    parser.add_argument("-V", "--verbose",
        action  = "store_true",
        help    = "Display verbose output."
    )
    parser.add_argument("-v", "--version",
        action  = "version",
        version = __version__,
        help    = "Show %s's version number and exit." % __name__
    )
    parser.add_argument("-h", "--help",
        action  = "help",
        default = argparse.SUPPRESS,
        help    = "Show this help message and exit."
    )

    return parser

def get_args(args = None, known = True, as_dict = True):
    parser  = get_parser()

    if known:
        args, _ = parser.parse_known_args(args)
    else:
        args    = parser.parse_args(args)

    if as_dict:
        args = args.__dict__
        
    return args