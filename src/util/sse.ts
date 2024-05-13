import { observable } from '@trpc/server/observable';

export function createObservableFromAsyncGenerator<T>(
  source: AsyncGenerator<T, void>,
) {
  return observable<T>((emit) => {
    const sink = (async () => {
      try {
        for await (const event of source) {
          emit.next(event);
        }
        emit.complete();
      } catch (e) {
        emit.error(e);
      } finally {
        await source.return();
      }
    })();

    return async () => {
      await source.return();
      await sink;
    };
  });
}
