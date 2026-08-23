// Shared button styling: every clickable element hovers, lifts, presses and
// shows a focus ring on the same 150ms transition.
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

const ACTIVE = 'active:scale-[0.98] disabled:active:scale-100'

export const buttonPrimary = `${BASE} ${ACTIVE} bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md disabled:hover:bg-blue-600 disabled:hover:shadow-sm`

export const buttonSecondary = `${BASE} ${ACTIVE} border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 disabled:hover:bg-white`

export const buttonDanger = `${BASE} ${ACTIVE} bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md disabled:hover:bg-red-600 disabled:hover:shadow-sm`

export const buttonSmall = 'px-3 py-1.5 text-xs'
