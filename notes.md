# Smart Clinic - Microservices Project

1. Patient Service - patient registration, profile management, medical history
2. Appointment service - appointment scheduling
3. doctor service - doctor profiles, schdules, specialization
4. EHR service - electronic health record storage and retrival
5. Presecription service
6. billing service
7. notification service
8. auth service
9. audit services

# Architecture pattern
 
1. api gateway pattern

- single entry point fr all client request
- handles routing, authentication, rate limiting and request aggregation
- reduces clien complexity and enforces cross cutting concern

2. BFF - backend for frontend pattern

- separate BFF for mobile app and admin portal
- tailored API responses optimized for specific client needs

3. database per service pattern

- each microservice owns its database, ensuring\
  - independent schema evolution
  -  improved scalability

4. CQRS (command query responsibility segregation)
- separate write models (for appointment booking) and read models (for schedule queries)

- optimizes read and write operations in dependendtly

5. Saga pattern

- manages distributed transaction across services
- example: booking an appointment involves checking doctor availability, reserving slot and initating billing
order service -> inventory service -> payment service -> notification service -> order service

# Features

- patient management
- Appointment scheduling
- Doctor management
- Prescription management
- Billing & insurance
- Notifications
- Security and compliances
 
 
# Advances features

- observability
- performance optimization
- deployment statregy
- serverless architecture
- docker and kuberentes

# Technology stack

- backend 
- nodejs
- express
- GraphQL
- gRPC
- message broker - kafka
- database
- mongodb
- redis
- infrastructure & devOps
- docker
- Kubernetes
- terraform
- GitHub actions / Jenkins
- aws / azure / GCP

# Project Structure
 
smart-clinic
  - gateway
  - services
   	- patient-service
   	- doctor-service
   	- auth-service
   	- audit-service

- shared
- infrastructure 
  - terraform
	- Kubernetes
	- docker
- monitoring
	- Prometheus
	- Grafana

- ci-cd
	- Jenkins
	- GitHub-actions

- docs