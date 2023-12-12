export function debounce<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends (...args: ReadonlyArray<any>) => void,
>(func: F, wait = 100) {
  let timeoutID: NodeJS.Timeout
  return function (...args: Parameters<F>) {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => func(...args), wait)
  } as F
}

export function asyncDebounce<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends (...args: ReadonlyArray<any>) => Promise<any>,
>(func: F, wait?: number) {
  const debounced = debounce(
    (
      resolve: (value: ReturnType<F> | PromiseLike<ReturnType<F>>) => void,
      reject: (reason: unknown) => void,
      args: Parameters<F>
    ) => {
      func(...args).then(resolve, reject)
    },
    wait
  )

  return (...args: Parameters<F>): ReturnType<F> =>
    new Promise((resolve, reject) => {
      debounced(resolve, reject, args)
    }) as ReturnType<F>
}
