const EventEmitter = require('events');
const logger = require('./logger');

class AsyncQueue extends EventEmitter {
  constructor(concurrency = 2) {
    super();
    this.queue = [];
    this.concurrency = concurrency;
    this.running = 0;
    this.failedJobs = new Map();
    this.maxRetries = 2;
  }

  push(task, jobId) {
    this.queue.push({ task, jobId, retryCount: 0 });
    this.process();
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const job = this.queue.shift();

    try {
      logger.info(`[QUEUE] Processing job: ${job.jobId} (attempt ${job.retryCount + 1})`);
      await job.task();
    } catch (err) {
      logger.error(`[QUEUE] Job ${job.jobId} failed: ${err.message}`);
      
      if (job.retryCount < this.maxRetries) {
        job.retryCount++;
        logger.info(`[QUEUE] Retrying job ${job.jobId} (${job.retryCount}/${this.maxRetries})`);
        this.queue.unshift(job);
      } else {
        this.failedJobs.set(job.jobId, {
          error: err.message,
          failedAt: new Date(),
          attempts: job.retryCount + 1
        });
      }
    } finally {
      this.running--;
      this.process();
    }
  }

  getStats() {
    return {
      pending: this.queue.length,
      running: this.running,
      failed: this.failedJobs.size
    };
  }
}

const ocrQueue = new AsyncQueue(2);

module.exports = { ocrQueue };