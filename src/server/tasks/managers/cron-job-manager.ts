import cron, { type ScheduledTask } from "node-cron";

class CronJobManager {
  private jobs: Record<string, ScheduledTask>;

  constructor() {
    this.jobs = {};
  }

  public startJob(name: string, schedule: string, taskFunc: () => void): void {
    this.stopJob(name); // Stop existing job with the same name if it exists
    this.jobs[name] = cron.schedule(schedule, taskFunc);
  }

  public stopJob(name: string): void {
    if (this.jobs[name]) {
      (this.jobs[name] as any).stop();
      delete this.jobs[name];
    }
  }

  public stopAllJobs(): void {
    Object.keys(this.jobs).forEach((jobName) => this.stopJob(jobName));
  }
}

export const jobManager = new CronJobManager();
