# ----------------------------------------- #
# SERVICE: auth
# ----------------------------------------- #
from django.contrib.auth.models import Group, Permission, User
from django.urls import reverse
from rest_framework.test import APITestCase


class AdminAuthenticatedAPITestCase(APITestCase):
  def setUp(self):
    self.client.post(reverse('register'),  {
        'email': 'admin22@cellcollective.org',
        'password': 'FuNnypass2143414',
        'vpassword': 'FuNnypass2143414',
        'first_name': 'test1',
        'last_name': 'part2',
        'institution': 'UNL',
        'ccappUserId': 121341
      }, format='json')
    
    # assign admin role for this user directly
    admin_group = Group.objects.get(name='ADMINS')
    User.objects.get(email='admin22@cellcollective.org').groups.add(admin_group)
     
		# get authenticattion token
    login_response = self.client.post(reverse('login'), {
      'email': 'admin22@cellcollective.org',
      'password': 'FuNnypass2143414'
    }, format='json')
    # set authorization header to client
    self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + login_response.data['access_token'])
    
class GroupListApiTest(AdminAuthenticatedAPITestCase):
  def setUp(self):
    super().setUp()
    self.url = reverse('group-list')

  def test_list_groups(self):
    response = self.client.get(self.url)
    self.assertEqual(response.status_code, 200)
    expected_group_names = {"ADMINS", "EDITORS", "VIEWERS", "STUDENTS", "TEACHERS", "RESEARCHERS", "GUESTS"}
    group_names = {group['name'] for group in response.data['data']['groups']}
    self.assertEqual(len(response.data['data']['groups']), 8)
    self.assertEqual(response.data['data']['name'], 'Role-Based Access Control (RBAC)')
    self.assertTrue(expected_group_names.issubset(group_names), "Response is missing some groups")
    
    
class PermissionListApiTest(AdminAuthenticatedAPITestCase):
  def setUp(self):
    super().setUp()
    self.url = reverse('permission-list')
    
  def test_list_permissions(self):
    response = self.client.get(self.url)
    self.assertEqual(response.status_code, 200)
    self.assertEqual(response.data['code'], 200)
    self.assertEqual(response.data['status'], 'success')
    self.assertEqual(response.data['message'], 'OK')
    self.assertGreater(len(response.data['data']['permissions']), 0, 'No permissions found')
    expected_keys = {'id', 'name', 'content_type', 'codename'}
    for perm in response.data['data']['permissions']:
      self.assertTrue(expected_keys.issubset(perm.keys()))
      
      
class AssignGroupPermissionApiTest(AdminAuthenticatedAPITestCase):
  def setUp(self):
    super().setUp()
    self.url = reverse('group-assign-permission')
    self.group = Group.objects.create(name= 'Test Group')
    self.permission = Permission.objects.first()
    
  def test_assign_group_permission(self):
    response = self.client.post(self.url, {
			'group_id': self.group.id,
			'permission_id': self.permission.id
		}, format='json')
    
    self.assertEqual(response.status_code, 200)
    self.assertIn('data', response.data)
    self.assertIn('assing', response.data['data'])
    assign_data = response.data['data']['assing']

		# Assert group data exists with expected values
    self.assertIn('group', assign_data)
    self.assertEqual(assign_data['group']['name'], self.group.name)
    self.assertEqual(assign_data['group']['id'], self.group.id)

		# Assert permission data exists with expected values
    self.assertIn('permission', assign_data)
    self.assertEqual(assign_data['permission']['name'], self.permission.name)
    self.assertEqual(assign_data['permission']['id'], self.permission.id)
    self.assertEqual(assign_data['permission']['codename'], self.permission.codename)
    
  def test_assign_group_permission_invalid_group(self):
    response = self.client.post(self.url, {
			'group_id': 322424131321,
			'permission_id': self.permission.id
		}, format='json')
    
    self.assertEqual(response.status_code, 404)
    
  def test_assign_group_permission_invalid_permission(self):
    response = self.client.post(self.url, {
			'group_id': self.group.id,
			'permission_id': 322424131321
		}, format='json')
    
    self.assertEqual(response.status_code, 404)


	
