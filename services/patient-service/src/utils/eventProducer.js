const { Kafka } = require('kafkajs');
const logger = require('./logger');
const config = require('../config');


// Note: here we just creating event but not consuming anywhere we need to created another service for notification or alerting system, where we can consume this using SAGA pattern

// kafka client configuration
const kafka = new Kafka({
  clientId: config.serviceName,
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(',')
    : ['localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

// create producer
const producer = kafka.producer();

const EVENT_TYPES = {
  PATIENT_CREATED: 'PATIENT_CREATED',
  PATIENT_UPDATED: 'PATIENT_UPDATED',
  PATIENT_DELETED: 'PATIENT_DELETED',
  MEDICAL_HISTORY_ADDED: 'MEDICAL_HISTORY_ADDED',
  ALLERGY_ADDED: 'ALLERGY_ADDED',
  MEDICATION_ADDED: 'MEDICATION_ADDED',
};

/**
 * Initialize Kafka producer
 */
const initializeProducer = async () => {
  try {
    await producer.connect();
    logger.info('Kafka producer connected');
  } catch (error) {
    logger.error('Failed to connect Kafka producer', error);
    throw error;
    // dont fail service startup if kafka is unavailable
    // service can still function without event publishing
  }
};

/**
 * Publish event to kafka
 * @params {String} eventType - Type of event
 * @params {Object} eventData = Data associated with the event
 */
const publishEvent = async (eventType, eventData) => {
  try {
    if (!producer) {
      logger.warn('Kafka Producer is not initialized. Skipping event publish.');
      return;
    }

    const event = {
      type: eventType,
      service: config.serviceName,
      timestamp: new Date().toISOString(),
      data: eventData,
    };

    const eventKey = eventData.patientId || eventData.id || 'unknown';
    await producer.send({
      topic: 'patient-events',
      messages: [
        {
          key: eventKey,
          value: JSON.stringify(event),
          headers: {
            eventType: eventType,
            service: config.serviceName,
          },
        },
      ],
    });

    logger.info(
      `Event published successfully: ${eventType} for patientId: ${eventKey}`
    );
  } catch (error) {
    logger.error(`Failed to publish event ${eventType}: ${error.message}`);
  }
};

/**
 * Shutdown Kafka producer
 * @returns {Promise<void>}
 */
const shutdownProducer = async () => {
  try {
    await producer.disconnect();
    logger.info('Kafka producer disconnected');
  } catch (error) {
    logger.error(`Failed to disconnect Kafka producer: ${error.message}`);
  }
};

module.exports = {
  initializeProducer,
  publishEvent,
  shutdownProducer,
  EVENT_TYPES,
};
