
def test_files():
    data = dict(file='model_export.json')
    assert data != dict(file='not_a_model_export.json')