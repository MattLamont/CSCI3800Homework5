curl -X POST -d '{"name":"Fun Wars","actors": [{"firstName": "Harrison","lastName": "Ford"},{"firstName": "person","lastName": "two"},{"firstName": "person","lastName": "three"}], "year_released": "1979" }' -H "Content-Type: application/json" http://localhost:10010/movie | python -m json.tool

