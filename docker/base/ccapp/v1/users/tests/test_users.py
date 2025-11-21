# ----------------------------------------- #
# SERVICE: users
# ----------------------------------------- #
import uuid
from django.contrib.auth.models import Group, Permission, User
from django.urls import reverse
from rest_framework.test import APITestCase


TEST_EMAIL_ACCOUNT = 'testaccount@cellcollective.org'
TEST_ADMIN_EMAIL_ACCOUNT1 = 'admin123@cellcollective.org'
TEST_PASSWD = 'FuNnypass2143414'


def create_test_user(client):
		response = client.post(reverse('register'),  {
			'email': TEST_EMAIL_ACCOUNT,
			'password': TEST_PASSWD,
			'vpassword': TEST_PASSWD,
			'first_name': 'test1',
			'last_name': 'part2',
			'institution': 1123,
			'ccappUserId': 121341
		}, format='json')
		return response.data['data']['profile']['user']

def create_admin_user(client):
	response = client.post(reverse('register'),  {
			'email': TEST_ADMIN_EMAIL_ACCOUNT1,
			'password': TEST_PASSWD,
			'vpassword': TEST_PASSWD,
			'first_name': 'testadmin1',
			'last_name': 'part3',
			'institution': 1123,
			'ccappUserId': 121341
		}, format='json')
	group=Group.objects.get(name='ADMINS')  
	User.objects.get(email=TEST_ADMIN_EMAIL_ACCOUNT1).groups.add(group)
	return response.data['data']['profile']['user']

def get_admin_token(client):
  login_response = client.post(reverse('login'), {
				'email': TEST_ADMIN_EMAIL_ACCOUNT1,
				'password': TEST_PASSWD
		}, format='json')
  return login_response.data['access_token']

def get_user_token(client):
  login_response = client.post(reverse('login'), {
				'email': TEST_EMAIL_ACCOUNT,
				'password': TEST_PASSWD
		}, format='json')
  return login_response.data['access_token']


class ProfileMeAPITestCase(APITestCase):
    def setUp(self):
      create_test_user(self.client)
      # user.id ==> uuid
			# assign admin role for this user directly
      group = Group.objects.get(name='TEACHERS')  
      User.objects.get(email=TEST_EMAIL_ACCOUNT).groups.add(group)
      self.url = reverse('profile-me')
      # get authenticattion token
      login_response = self.client.post(reverse('login'), {
      'email': TEST_EMAIL_ACCOUNT,
      'password': TEST_PASSWD
      }, format='json')
      # set authorization header to client
      self.auth_token = login_response.data['access_token']
     

    def test_profile_me(self):
      self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.auth_token)
      response = self.client.get(self.url, format='json')
      self.assertEqual(response.status_code, 200)
      self.assertEqual(response.data['data']['user']['email'], TEST_EMAIL_ACCOUNT)
      self.assertEqual(response.data['data']['user']['first_name'], 'test1')
      self.assertEqual(response.data['data']['user']['last_name'], 'part2')
      self.assertEqual(response.data['data']['user']['is_superuser'], False)
      self.assertEqual(response.data['data']['user']['is_active'], True)
      self.assertIsNotNone(response.data['data']['profile']['user']['auth_user_id'] )
      expected_group_names = { 'TEACHERS', 'STUDENTS'}
      groups = {group['name'] for group in response.data['data']['groups']}
      self.assertTrue(expected_group_names.issubset(groups))
      
    def test_profile_me_with_authorized_user(self):
      # self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + 'Invalid Token')
      response = self.client.get(self.url, format='json')
      self.assertEqual(response.status_code, 401)

 
class AssignGroupPermissionTest(APITestCase):
  def setUp(self):
    # create user, student
    user = create_test_user(self.client)
    # request permission to group for user
    self.client.post(reverse('request-new-user-group'), {
      'new_group': 'TEACHERS'
      }, format='json')
    # create admin
    admin = create_admin_user(self.client)
    # login with admin account
    self.user = user
    self.admin = admin

  def test_assign_group_permission(self):
    self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + get_admin_token(self.client))
    # assign user to group they requested.
    response = self.client.post(reverse('assign-group-permission'), {
      'user_id': self.user['id'],
      'group': 'TEACHERS'
      }, format='json')
    # verify request successful
    self.assertEqual(response.status_code, 200)
    # verify user belong to those groups
    self.assertEqual(response.data['data']['group']['name'], 'TEACHERS')
    
  def test_assign_group_permission_with_invalid_token(self):
    self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + 'invalidtoken')
    # assign user to group they requested.
    response = self.client.post(reverse('assign-group-permission'), {
      'user_id': self.user['id'],
      'group': 'TEACHERS'
      }, format='json')
    
    # verify request successful
    self.assertEqual(response.status_code, 401)
  
  def test_assign_group_permission_with_invalid_user_id(self):
    self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + get_admin_token(self.client))
    # assign user to group they requested.
    response = self.client.post(reverse('assign-group-permission'), {
      'user_id': 9809776767876,
      'group': 'TEACHERS'
      }, format='json')
    
    self.assertEqual(response.status_code, 404)
  
  def test_assign_group_permission_with_invalid_group(self):
    self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + get_admin_token(self.client))
    # assign user to group they requested.
    response = self.client.post(reverse('assign-group-permission'), {
      'user_id': self.user['id'],
      'group': 'TEACHERS1'
      }, format='json')
    
    self.assertEqual(response.status_code, 500)
    
  def test_assign_group_permission_for_nonadmin_user(self):
    self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + get_user_token(self.client))
    # assign user to group they requested.
    response = self.client.post(reverse('assign-group-permission'), {
      'user_id': self.user['id'],
      'group': 'TEACHERS'
      }, format='json')

    self.assertEqual(response.status_code, 400)
    
   
    
class FetchUserGroupTest(APITestCase):
  def setUp(self):
    self.test_user = create_test_user(self.client)
    group = Group.objects.get(name='TEACHERS')  
    User.objects.get(email=TEST_EMAIL_ACCOUNT).groups.add(group)
		# get authenticattion token
    login_response = self.client.post(reverse('login'), {
				'email': TEST_EMAIL_ACCOUNT,
				'password': TEST_PASSWD
		}, format='json')
		# set authorization header to client
    self.auth_token = login_response.data['access_token']
  
  def test_fetch_user_group(self):
    self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.auth_token)
    response = self.client.get(reverse(viewname='user-groups', args=[self.test_user['id']]))
    self.assertEqual(response.status_code, 200)
    self.assertEqual(response.data['data']['user']['auth_user_id'], self.test_user['auth_user_id'])
    expected_group_names = { 'TEACHERS', 'STUDENTS'}
    groups = {group['name'] for group in response.data['data']['groups']}
    self.assertTrue(expected_group_names.issubset(groups))
    
  def test_fetch_user_group_with_invalid_user_id(self):
    self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.auth_token)
    response = self.client.get(reverse(viewname='user-groups', args=[str(uuid.uuid4())]))
    self.assertEqual(response.status_code, 404)
    
  def test_fetch_user_group_with_authorized_user(self):
    self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + 'Invalid Token')
    response = self.client.get(reverse(viewname='user-groups', args=[self.test_user['id']]))
    self.assertEqual(response.status_code, 401)
  