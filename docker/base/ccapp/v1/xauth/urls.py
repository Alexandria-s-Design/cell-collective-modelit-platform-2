# ----------------------------------------- #
# SERVICE: xauth
# ----------------------------------------- #
from django.urls import path
from .views import (
	LoginView,
	LogoutView,
	GroupListView,
	PermissionListView,
	AssignGroupPermissionView,
	TokenRefreshStorageView,
	TokenVerifyStorageView,
	GoogleLoginRedirectApi,
	GoogleLoginApi,
	LoginThirdPartyView,
	FacebookLoginRedirectApi,
	FacebookLoginApi,
	LinkedInLoginRedirectApi,
	LinkedInLoginApi,
	TestImportUsers,
  ImpersonateUserView
)

urlpatterns = [
		path('login', LoginView.as_view(), name='login'),
		path('logout/<str:token>', LogoutView.as_view(), name='logout'),
    path('token/refresh', TokenRefreshStorageView.as_view(), name='token_refresh'),
		path('group/list', GroupListView.as_view(), name='group-list'),
		path('permission/list', PermissionListView.as_view(), name='permission-list'),
		path('group/assign/permission', AssignGroupPermissionView.as_view(), name='group-assign-permission'),
		path('token/verify', TokenVerifyStorageView.as_view(), name='token_verify'),
		path("google-callback", GoogleLoginApi.as_view(), name="google-callback"),
    path("google-redirect", GoogleLoginRedirectApi.as_view(), name="google-redirect"),
		path('login-thirdparty', LoginThirdPartyView.as_view(), name='login-thirdparty'),
		path("facebook-redirect", FacebookLoginRedirectApi.as_view(), name="facebook-redirect"),
		path("facebook-callback", FacebookLoginApi.as_view(), name="facebook-callback"),
		path("linkedin-redirect", LinkedInLoginRedirectApi.as_view(), name="linkedin-redirect"),
		path("linkedin-callback", LinkedInLoginApi.as_view(), name="linkedin-callback"),
		path("test", TestImportUsers.as_view(), name="test-import-users"),
    path('impersonate', ImpersonateUserView.as_view(), name='impersonate-user'),
]