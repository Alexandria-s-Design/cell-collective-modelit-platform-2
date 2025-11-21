from ccpy.config  import Settings
from ccpy         import __version__

def test_settings():
    settings = Settings()
    settings.get("version") == __version__