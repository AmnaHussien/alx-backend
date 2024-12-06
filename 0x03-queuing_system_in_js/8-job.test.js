import {
  describe, it, before, after, afterEach,
} from 'mocha';
import { expect } from 'chai';
import kue from 'kue';
import createPushNotificationsJobs from './8-job';

const queue = kue.createQueue();

describe('createPushNotificationsJobs', () => {
  const jobs = [
    {
      phoneNumber: '4158718781',
      message: 'This is the code 4562 to verify your account',
    },
    {
      phoneNumber: '4151218782',
      message: 'This is the code 4321 to verify your account',
    },
  ];

  before(() => {
    queue.testMode.enter();
  });

  afterEach(() => {
    queue.testMode.clear();
  });

  after(() => {
    queue.testMode.exit();
  });

  it('display a error message if jobs is not an array', () => {
    expect(() => createPushNotificationsJobs(jobs[0], queue)).to.throw(Error, 'Jobs is not an array');
  });

  it('create two new jobs to the queue', () => {
    createPushNotificationsJobs(jobs, queue);

    expect(queue.testMode.jobs.length).to.equal(2);
    expect(queue.testMode.jobs[0].type).to.equal('push_notification_code_3');
    expect(queue.testMode.jobs[0].data).to.eql(jobs[0]);
    expect(queue.testMode.jobs[1].type).to.equal('push_notification_code_3');
    expect(queue.testMode.jobs[1].data).to.eql(jobs[1]);
  });
});
