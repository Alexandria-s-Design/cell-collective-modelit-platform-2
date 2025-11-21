from rest_framework.views import exception_handler
from rest_framework.exceptions import NotFound
from cc.core_exceptions import (
  APILoginError,
  APIInternalError,
  APIBadRequestError,
  APITokenExpiredError,
  APIRefreshTokenError,
  APIDuplicateUserError,
	APIDuplicateEmailError,
  APILoginDoesNotExistError
)
from cc.core_http_status_code import (
  HttpStatusCode
)
from cc.core_http_response import http_message_response
import uuid

def core_exception_handler(exc, context):
    
    response = exception_handler(exc, context)

    if response is not None:
        pkUUID = str(uuid.uuid4())
        if isinstance(exc, NotFound):
            response.data = {
                'id': pkUUID,
                'data': {'error': 'The requested resource was not found.'},
                'version': '1.0',
                'status': 'error',
                'code': HttpStatusCode.HTTP_404_NOT_FOUND
            }
        if isinstance(exc, (
            APILoginError,
            APIInternalError,
            APIBadRequestError,
            APIRefreshTokenError,
            APIDuplicateUserError,
            APIDuplicateEmailError,
            APILoginDoesNotExistError,
            APITokenExpiredError
        )):
            http_msg = http_message_response(exc.code)
            response.status_code = exc.code
            response.data = {
                'id': pkUUID,
                'data': {'error': str(exc)},
                'version': '1.0',
                'status': http_msg["type"],
                'message': http_msg['message'],
                'code': exc.code
            }
        else:
            http_msg = http_message_response(response.status_code)
            error_messages = response.data.get('detail', 'An unexpected error occurred.')
            if isinstance(error_messages, list):
                error_messages = ' '.join(error_messages)
            response.data = {
                'id': pkUUID,
                'data': response.data,
                'version': '1.0',
                'status': http_msg["type"],
                'message': http_msg["message"] + ". " + error_messages,
                'code': response.status_code
            }
    
    return response