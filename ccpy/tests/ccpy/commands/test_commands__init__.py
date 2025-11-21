import os.path as osp

# imports - compatibility imports
from ccpy.commands    import command
from ccpy.util._dict  import merge_dict

# imports - test imports
import pytest

# imports - test imports
from testutils import mock_input, PATH

def test_command_self(capfd):
    command(self = True)
    out, err = capfd.readouterr()
    assert "upto date." in out