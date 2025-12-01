import numberToCurrency from '@/utils/numberToCurrency'
import clsx from 'clsx'

function Amount({ amount, className }: { amount: number; className?: string }) {
  return (
    <p className={clsx('flex items-end text-3xl font-medium', className)}>
      <span className="text-bg-500 mr-2 text-xl">RM</span>

      <span className="truncate">{numberToCurrency(amount)}</span>
    </p>
  )
}

export default Amount
