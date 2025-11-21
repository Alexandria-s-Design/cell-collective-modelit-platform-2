from rest_framework.request import Request as DRFRequest

class CoreHTTPLoginRequest(DRFRequest):
    
    def __init__(self, *args,  **kwargs):
        super().__init__(*args, **kwargs)

    @property
    def data(self):         
        form_data = super().data.copy()
        form_data['username'] = self.__user__.username
        form_data.pop('email', None)
        return form_data
   