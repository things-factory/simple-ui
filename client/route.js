export default function route(page) {
  switch (page) {
    case 'index':
      return 'grid-test'

    case 'grid-test':
      import('./pages/grid-test')
      return page

    case 'list-test':
      import('./pages/list-test')
      return page
  }
}
