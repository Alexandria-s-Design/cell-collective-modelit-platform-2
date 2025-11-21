from rest_framework import status
from rest_framework.response import Response
import uuid

def http_message_response(status_code):    
    if status_code == 200:
        return {"type": "success", "message": "OK"}
    elif status_code == 201:
        return {"type": "success", "message": "Created"}
    elif status_code == 204:
        return {"type": "success", "message": "No Content"}
    elif status_code == 400:
        return {"type": "error", "message": "Bad Request"}
    elif status_code == 401:
        return {"type": "error", "message": "Unauthorized"}
    elif status_code == 403:
        return {"type": "error", "message": "Forbidden"}
    elif status_code == 404:
        return {"type": "error", "message": "Not Found"}
    elif status_code == 500:
        return {"type": "error", "message": "Internal Server Error"}
    elif status_code == 502:
        return {"type": "error", "message": "Bad Gateway"}
    elif status_code == 503:
        return {"type": "error", "message": "Service Unavailable"}
    else:
        return {"type": "error", "message": f"Unhandled Status Code: {status_code}"}

class CoreResponseFormat():
    
    def __init__(self, data, message, status):
        self.data = data
        self.message = message
        self.status = status
        
    def json(self):
        http_msg = http_message_response(self.status)
        return {
            "id": str(uuid.uuid4()),
            "data": self.data,
            "version": "1.0",
            'status': http_msg["type"],
            'code': self.status,
            "message": self.message
				}

class CoreHttpResponse():
    
    def __init__(self, data, status=status.HTTP_200_OK, message = ''):
        self.data = data
        self.status = status
        self.msg = message                      

    def json(self):
        http_msg = http_message_response(self.status)
        data_format = {
          'id': str(uuid.uuid4()),
          'data': self.data,
          'version': '1.0',
          'status': http_msg["type"],
          'code': self.status,
          'message': self.msg if self.msg != '' else http_msg["message"]
        }
        return Response(data_format, status=self.status)

		 
	