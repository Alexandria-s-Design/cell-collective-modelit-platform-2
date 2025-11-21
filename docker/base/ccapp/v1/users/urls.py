# ----------------------------------------- #
# SERVICE: users
# ----------------------------------------- #
from django.urls import path
from .views import (
  ProfileView,
  RegisterView,
	ChangePasswordView,
  ProfileMeView,
  AssignGroupView,
  UserEnableView,
  UserDisableView,
  UserGroupsView,
  GetUsersView,
  RemoveGroupView,
  UserGroupsRequestView,
	ResetPasswordView,
  RejectUserGroupRequestView,
  GetNotificationsView
)

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('change-password', ChangePasswordView.as_view(), name='change-password'),
    path('profile/me', ProfileMeView.as_view(), name='profile-me'),
    path('profile/edit/<str:pkUUID>', ProfileView.as_view(), name='profile'),
		path('disable/<str:pkUUID>', UserDisableView.as_view(), name='disable'),
		path('enable/<str:pkUUID>', UserEnableView.as_view(), name='enable'),
		path('assign/group-permission', AssignGroupView.as_view(), name='assign-group-permission'),
		path('remove/group-permission', RemoveGroupView.as_view(), name='remove-group-permission'),
		path('groups/<str:pkUserUUID>', UserGroupsView.as_view(), name='user-groups'),
		path('', GetUsersView.as_view(), name='users-list'),
		path('group/reject-request', RejectUserGroupRequestView.as_view(), name='reject-user-group-request'),	
		path('group/request', UserGroupsRequestView.as_view(), name='request-new-user-group'),
		path('reset-password', ResetPasswordView.as_view(), name='reset-password'),
    path('user/notifications', GetNotificationsView.as_view(), name='user-notifications')
]