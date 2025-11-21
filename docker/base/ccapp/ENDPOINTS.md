
1. **`POST: localhost:8005/v1/auth/login`**  
   Endpoint for user authentication. It accepts user credentials (like username and password) and returns a token for authenticated access.

2. **`GET: localhost:8005/v1/auth/logout/<str:token>`**  
   Endpoint to log out a user by invalidating their token, ensuring they are no longer authenticated.

3. **`POST: localhost:8005/v1/auth/token/refresh`**  
   Refreshes an existing authentication token, allowing the user to maintain their session without logging in again.

4. **`POST: localhost:8005/v1/users/register`**  
   Endpoint to register a new user, typically requires details like username, email, and password.

5. **`GET: localhost:8005/v1/users/profile/me`**  
   Retrieves the profile information of the currently authenticated user.

6. **`PUT: localhost:8005/v1/users/profile/edit/<str:pkUUID>`**  
   Allows an authenticated user to edit their profile, identified by a UUID.

7. **`GET: localhost:8005/v1/users/disable/<str:pkUUID>`**  
   Disables a user account identified by a UUID, preventing them from logging in or accessing the system.

8. **`GET: localhost:8005/v1/users/enable/<str:pkUUID>`**  
   Enables a previously disabled user account, identified by a UUID.

9. **`POST: localhost:8005/v1/users/assign/group-permission`**  
   Assigns a group permission to a user or group, allowing role-based access control.

10. **`POST: localhost:8005/v1/users/assign/user-group`**  
    Assigns a user to a specific group, aligning them with certain roles or permissions.

11.  **`POST: localhost:8005/v1/users/reset-password`** 
		Resets a user's password using the secret, password and vpassword fields.

12. **`GET: localhost:8005/v1/users/groups/<str:pkUserUUID>`**  
    Retrieves all groups that a user (identified by a UUID) belongs to.

13. **`POST: localhost:8005/v1/oauth/group/permissions`**  
    Retrieves the permissions assigned to all groups in the system, useful for OAuth-based authentication and authorization.

14. **`POST: localhost:8005/v1/oauth/permissions/group/<str:group_name>`**  
    Retrieves permissions for a specific group, identified by its name.

15. **`GET: localhost:8005/v1/auth/group/list`**  
    Lists all available groups within the authentication system.

16. **`GET: localhost:8005/v1/auth/permission/list`**  
    Lists all available permissions in the system.

17. **`POST: localhost:8005/v1/auth/group/assign/permission`**  
    Assigns specific permissions to a group, controlling what actions members of that group can perform.

18. **`GET: localhost:8005/v1/auth/password-reset`**  
    Initiates a password reset for a user by sending a reset link to their registered email.

19. **`GET: localhost:8005/v1/auth/password-reset-confirm/<str:uidb64>/<str:token>/`**  
    Verifies the password reset link using a token and user ID, allowing the user to proceed with resetting their password.

20. **`GET: localhost:8005/v1/auth/password-reset-message`**  
    Sends a message or confirmation regarding a password reset request, likely to notify the user about the reset process.