## Logger

Responsible for recording or logging events, messages, or data
during the execution of the program.

### Build

```bash
./ccman up --build -d logger
```

### Create log

**List of Groups**
- WEB::MODEL -- Model interactions on the React.js frontend
- API::MODEL -- Model interactions on the Node.js backend

```bash
POST /add/log
{
	level: 'INFO',
	file: 'readme.js',
	line: 0,
	group: 'NAME',
	action: 'INSERT', # UPDATE, DELETE, FETCH
	message: 'My message',
	user: \"{id: 999, email: "name@gmail.com", name: "User"}\",
	stack: 'stack trace'
}
```

### List logs by year
```bash
GET "/logs
```


### List logs by year and month
```bash
GET "/logs/days?year=2024&month=05"
```


### View log
```bash
GET "/logs/view?year=2024&month=05&day=01"
```

### NodeJS usage

```javascript
//Create of Info
loggerHttp.info('Custom message');

//Create of Error
let err = new Error();
loggerHttp.error(err, __filename);
```


### List Logs by public URL

```bash
# Development
http://localhost:7001/logs

# Production
https://cellcollective.org/logger/logs
https://hotfix.cellcollective.org/logger/logs
https://develop.cellcollective.org/logger/logs
```
