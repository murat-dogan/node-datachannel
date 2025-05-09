export interface EventPromiseOptions {
  errorEvent?: string
}

export async function eventPromise <T = unknown> (emitter: EventTarget, event: string, opts?: EventPromiseOptions): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emitter.addEventListener(event, (evt: any) => {
      resolve(evt);
    });
    emitter.addEventListener(opts?.errorEvent ?? 'error', (err) => {
      reject(err);
    });
  });
}
