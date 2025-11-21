from ccpy.model.package import (
    _get_pypi_info,
    _get_package_version,
    _get_pip_info
)
from ccpy.__attr__ import (
    __name__    as NAME,
    __author__
)
from ccpy import semver

def test___get_pypi_info():
    info = _get_pypi_info("ccpy")
    assert info["author"] == "Achilles Rasquinha"

def test__get_package_version():
    version = _get_package_version("ccpy")
    semver.parse(version)

def test__get_pip_info():
    packages = _get_pip_info("ccpy", "pytest")

    assert packages["ccpy"]["name"]      == NAME
    assert packages["ccpy"]["author"]    == __author__

    assert packages["pytest"]["name"]          == "pytest"
    assert packages["pytest"]["license"]       == "MIT license"