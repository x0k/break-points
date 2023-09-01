import './app.css'
import App from './app.svelte'

const target = document.getElementById('app')

function isElement(value: unknown): asserts value is HTMLElement {
  if (!(value instanceof Element)) {
    throw new Error('Expected Element')
  }
}

isElement(target)

const app = new App({
  target,
})

export default app
