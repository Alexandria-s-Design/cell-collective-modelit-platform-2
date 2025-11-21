
### Running API

```bash
docker compose up --build -d
docker network connect ccba_ccba-api_network cellcollective-app-1
```
OR

```bash
docker build -t ccba-api .
docker network create ccba_ccba-api_network
docker run -d --name ccba -p 5009:5009 ccba-api
docker network connect ccba_ccba-api_network ccba
docker network connect ccba_ccba-api_network cellcollective-app-1
```

### TO-DO

Apply features in the `ccbooleananalysis` library as follows:

MiniSat memory configuration in the MiniSat initialization, specify memory settings:

```javascript
self._minisat = new MiniSat({
  TOTAL_MEMORY: 536870912, // 512 MB
  ALLOW_MEMORY_GROWTH: true
});
```

Use a deep flatten function for expressions. Replace the flat function with a deep version:

```javascript
function flatDeep(arr) {
  return arr.reduce(function (acc, val) {
    return acc.concat(Array.isArray(val) ? flatDeep(val) : val);
  }, []);
}
var flat = flatDeep;
```

