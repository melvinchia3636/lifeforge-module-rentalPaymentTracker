import { style } from '@vanilla-extract/css'

import { COLORS, colorWithOpacity, vars } from '@lifeforge/ui'

export const table = style({
  marginTop: '16px',
  width: '100%',
  borderCollapse: 'collapse'
})

export const header = style({
  color: COLORS['bg-500'],
  padding: '12px 16px',
  textAlign: 'center',
  fontWeight: 500
})

export const label = style({
  color: COLORS['bg-500'],
  padding: '12px 16px'
})

export const value = style({
  color: COLORS['bg-500'],
  padding: '12px 16px',
  textAlign: 'right',
  fontWeight: 500
})

export const row = style({
  selectors: {
    '&:nth-child(odd)': {
      backgroundColor: colorWithOpacity('bg-200', '5%').toString()
    }
  }
})

export const totalValue = style({
  borderTop: `1.5px solid ${COLORS['bg-200']}`,
  textAlign: 'right',
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.semibold
})

export const totalDivider = style({
  borderBottom: `4px double ${COLORS['bg-200']}`,
  padding: '12px 16px'
})

export const borderBottom = style({
  borderBottom: `1.5px solid ${COLORS['bg-200']}`
})

export const green = style({
  color: COLORS['green-600']
})

export const red = style({
  color: COLORS['red-600']
})
