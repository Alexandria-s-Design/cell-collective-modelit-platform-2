from rest_framework.exceptions import APIException
from cc.core_http_status_code import HttpStatusCode

class APIDuplicateEmailError(APIException):
    def __init__(self, email):
        self.email = email
        self.message = f"This email '{email}' has already been registered. Please try to login instead."
        self.code = HttpStatusCode.HTTP_406_NOT_ACCEPTABLE
        super().__init__(self.message)
        
class APIDuplicateUserError(APIException):
    def __init__(self, username):
        self.username = username
        self.message = f"This username '{username}' has already been registered. Please try to login instead."
        self.code = HttpStatusCode.HTTP_406_NOT_ACCEPTABLE
        super().__init__(self.message)
        
class APILoginError(APIException):
    def __init__(self, class_type):
        self.class_type = class_type
        self.message = f"Invalid credentials. Please try again."
        self.code = HttpStatusCode.HTTP_400_BAD_REQUEST
        super().__init__(self.message)
        
class APIUnauthorizedError(APIException):
    def __init__(self, user_uuid):
        self.user_uuid = user_uuid
        self.message = f"Unauthorized User {user_uuid}."
        self.code = HttpStatusCode.HTTP_401_UNAUTHORIZED
        super().__init__(self.message)
        
class APIPermissionDeniedError(APIException):
    def __init__(self, details):
        self.message = f"Permission Denied: {details}."
        self.code = HttpStatusCode.HTTP_403_FORBIDDEN
        super().__init__(self.message)
         
class APIRouteDoesNotExistError(APIException):
     def __init__(self, path, method):
        self.path = path
        self.method = method
        self.message = f"Invalid request. Route {method} {path}."
        self.code = HttpStatusCode.HTTP_404_NOT_FOUND
        super().__init__(self.message)
        
class APIBadRequestError(APIException):
     def __init__(self, details):
        self.details = details
        self.message = f"Bad Request. {details}"
        self.code = HttpStatusCode.HTTP_400_BAD_REQUEST
        super().__init__(self.message)
        
class APIInternalError(APIException):
     def __init__(self, details):
        self.details = details
        self.message = f"{details}"
        self.code = HttpStatusCode.HTTP_500_INTERNAL_SERVER_ERROR
        super().__init__(self.message)
        
class APIRefreshTokenError(APIException):
     def __init__(self, details):
        self.details = details
        self.message = f"{details}"
        self.code = HttpStatusCode.HTTP_400_BAD_REQUEST
        super().__init__(self.message)
        
class APILoginDoesNotExistError(APIException):
    def __init__(self, user_uuid):
        self.user_uuid = user_uuid
        self.message = f"User Login {user_uuid} does not exist."
        self.code = HttpStatusCode.HTTP_404_NOT_FOUND
        super().__init__(self.message)
        
class APITokenExpiredError(APIException):
     def __init__(self, details):
        self.details = details
        self.message = f"{details}"
        self.code = HttpStatusCode.HTTP_401_UNAUTHORIZED
        super().__init__(self.message)
        
class APIGroupDoesNotExistError(APIException):
    def __init__(self, group_name):
        self.user_uuid = group_name
        self.message = f"{group_name} is not a valid group."
        self.code = HttpStatusCode.HTTP_404_NOT_FOUND
        super().__init__(self.message)