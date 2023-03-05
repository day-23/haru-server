import { Throttle } from '@nestjs/throttler';

export const ThrottleAll = (limit: number, ttl: number) => {
  return (target: any) => {
    for (const key in target.prototype) {
      if (typeof target.prototype[key] === 'function') {
        target.prototype[key] = Throttle(limit, ttl)(target.prototype[key]);
      }
    }
    return target;
  };
};
