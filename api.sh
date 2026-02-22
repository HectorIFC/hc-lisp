#!/bin/bash

pkill -f "api-example"; sleep 2 && npm run hclisp api-example.hclisp > debug.log 2>&1 & sleep 3 && curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"Pedro","email":"pedro@test.com"}';
curl http://localhost:3000/api/users;
curl http://localhost:3000/api/users/1;
