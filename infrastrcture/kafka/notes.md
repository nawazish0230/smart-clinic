# Event Driven Architecture

EDA is a style of building system where events are the primary way systems communicates

An event = something that happend in the system

- order-places
- user-registered
- payment-completed
- appointmnent-booked

when an event happens, it is published and other services that care about it react

# Key Concept

- Event : something that happend

- Producer: Service that publishs event

- Consumer: Service that listens to event

- Event Bus / Message Broker / Exchange

infrastructire that delivers events

- kafka
- RabbitMQ
- Azure Event Hub
- AWS SNS / SQS

# Why EDA is important

- Loose Coupling

- Scalability

- Flexibility

- Async Processing

- Resilient

# Kafka

Apache kafka is a distributed event streaming platform used for building real time data pipelines, event driven microservices and streaming analytics

Kafka = A central message hub for all microservices

# Features

- Distributed
- Scalable
- Fault tolerant
- Real time
- High Througput
- Persistent logs
- replay event
- handle streamning

# Start Kafka

1. create docker-compose.yaml file

```
javscript
version: "3.8"

services:
  zookeeper:
    image: wurstmeister/zookeeper
    container_name: zookeeper
    ports:
      - "2181:2181"
  kafka:
    image: wurstmeister/kafka
    container_name: kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_ADVERTISED_HOST_NAME: localhost
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181

```

2. start the container

> docker-compose up -d

3. test the cointainers

> docker ps

> docker exec -it <container_name / container_id> bash
> docker exec -it kafka bash
> cd /opt/kafka_2.13-2.8.1/bin
> ls
> connect-distributed.sh kafka-dump-log.sh kafka-storage.sh
> connect-mirror-maker.sh kafka-features.sh kafka-streams-application-reset.sh
> connect-standalone.sh kafka-leader-election.sh kafka-topics.sh
> kafka-acls.sh kafka-log-dirs.sh kafka-verifiable-consumer.sh
> kafka-broker-api-versions.sh kafka-metadata-shell.sh kafka-verifiable-producer.sh
> kafka-cluster.sh kafka-mirror-maker.sh trogdor.sh
> kafka-configs.sh kafka-preferred-replica-election.sh windows
> kafka-console-consumer.sh kafka-producer-perf-test.sh zookeeper-security-migration.sh
> kafka-console-producer.sh kafka-reassign-partitions.sh zookeeper-server-start.sh
> kafka-consumer-groups.sh kafka-replica-verification.sh zookeeper-server-stop.sh
> kafka-consumer-perf-test.sh kafka-run-class.sh zookeeper-shell.sh
> kafka-delegation-tokens.sh kafka-server-start.sh
> kafka-delete-records.sh kafka-server-stop.sh

4. Create a topic
   > kafka-topics.sh --create --topic test-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1

(optional or when topics is create by code)

> kafka-topics.sh --list --bootstrap-server localhost:9092

> kafka-topics.sh --describe --topic test-topic --bootstrap-server localhost:9092

> kafka-topics.sh --delete --topic test-topic --bootstrap-server localhost:9092

5. start producer

   > kafka-console-producer.sh --bootstrap-server localhost:9092 --topic test-topic

6. start consumer
   > kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning

or

1. download the zip folder

https://kafka.apache.org/downloads
