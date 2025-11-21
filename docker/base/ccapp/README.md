## CC APP - Django

### Best Practices

Python Enhancement Proposal for style guidelines:

**PEP 8 Guidelines**

- Function and Method Names: Use snake_case for function and method names.
  Example: def calculate_total_price()

- Variable Names: Also use snake_case for variable names.
  Example: total_price = calculate_total_price()

**CamelCase**

- Class Names: Use CamelCase for class names.
  Example: class OrderProcessor:

- Constants: Use UPPER_SNAKE_CASE for constants.
  Example: MAX_RETRIES = 5


### QUICK INSTALL GUIDE

```bash
./ccman up --build -d dbccapp ccapp
# ./ccman exec dbccapp shell # test db connection
./ccman exec ccapp python manage.py showmigrations
./ccman exec ccapp python manage.py migrate
./ccman exec ccapp python manage.py seed_users
```
Now access: http://localhost:8005/v1

### ADMIN MIGRATIONS

```bash
./ccman exec dbccapp shell # test connection
./ccman exec ccapp python manage.py migrate
```

Results in 10 tables:

1 - auth_group
2 - auth_group_permissions
3 - auth_permission
4 - auth_user
5 - auth_user_groups
6 - auth_user_user_permissions
7 - django_admin_log
8 - django_content_type
9 - django_migrations
10 - django_session

### SERVICE (Create Service)

See below how you can create a new Service:

A BETA version command for genarete service automatically:

```bash
python3 docker/base/ccapp/makeservice.py my-module my-service
```

**OUTPUT:**
```
==> Service my-service created successfully!
```


1 - Add Module at the settings: `config/settings.py`

```python
INSTALLED_APPS = [
   'my-module-v1.my-service',
]
```

2 - Create these new files into: `my-module-v1/my-service`

``` bash
# services/__init__.py
# services/service_factory.py
# services/service_interfaces.py
# services/my-service_service.py
# migrations/__init__.py
# management/__init__.py
# tests/__init__.py
# models.py
# urls.py
# views.py
# __init__.py
```

3 - Add Routes at the urls: `config/urls.py`

```python
urlpatterns = [
    path('my-module-v1/my-service', include('my-module-v1.my-service.urls')),
]
```

4 - Add model migration at `my-module-v1/my-service/models.py`

5 - Running Migrations

```bash
./ccman exec ccapp python manage.py makemigrations my-service
./ccman exec ccapp python manage.py migrate my-service
```

6 - Unit Tests

```bash
./ccman exec ccapp python manage.py test my-module.my-service.tests
```

6 - Seed Database


A - Seed in commands:

Add new command at `my-module-v1/my-service/management/commands/seed_my-service.py`.
Now, you can run this file using the following command:

```bash
./ccman exec ccapp python manage.py seed_my-service
```
B - Seed in migrations

Add new command at `my-module-v1/my-service/migrations/000x_seed_my-service.py`.

```bash
./ccman exec ccapp python manage.py migrate my-service
```

7 - Signal Handlers

In signals.py, you can define your post_save signal handlers.
For example, to create a Profile model when a User instance is created:

### Invoking/Calling Services

Services should be invoked in views.py. Example:

```python
from django.http import JsonResponse
from ..service_manager import ServiceManager
service_manager = ServiceManager()
# In this method, we can call all methods declared in my-services/services/service_interfaces.
my_service = service_manager.get_service("my-service", "get_factory_service")
```

This approach is beneficial for several reasons:

1. **Separation of Concerns**: By calling services in `views.py`, you're maintaining
a clear separation between the business logic (services) and the HTTP layer (views).
This makes our codebase more modular and easier to maintain.

2. **Reusability**: Services are reusable across different views and even other parts
of the application. This avoids code duplication and promotes cleaner, more DRY code
(Don't Repeat Yourself).

3. **Abstraction**: By using the `ServiceManager`, you're abstracting the details of
how services are created and managed. The `get_service` method allows the view to retrieve
and use the necessary service without worrying about its instantiation details.

4. **Scalability**: As the application grows, managing services through a centralized
service manager simplifies adding or modifying services without needing to change code
in multiple places.

5. **Testability**: Isolating service logic into its own layer makes unit testing easier.
You can mock services when testing the view logic, ensuring that tests are focused and
less complex.

6. **Flexibility**: The `ServiceManager` provides a flexible way to manage different services,
allowing easy configuration of which service to use or swap in different implementations
without changing the core business logic.
