import { writable, type Writable } from 'svelte/store'
import { stringify, parse } from 'devalue'

export function localWritable<T>(key: string, initialData: T): Writable<T> {
    const value = localStorage.getItem(key)
    const store = writable(value === null ? initialData : parse(value))
    store.subscribe((value) => {
      localStorage.setItem(key, stringify(value))
    })
    return store
}
