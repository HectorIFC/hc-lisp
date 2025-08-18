#!/bin/bash

curl http://localhost:3000/api/users;
curl http://localhost:3000/api/users/1;
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Pedro","email":"pedro@test.com"}';
