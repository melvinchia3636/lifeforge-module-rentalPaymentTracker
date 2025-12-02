import React from 'react'

function TransactionListItem({
  transaction,
  className
}: {
  transaction: unknown
  className?: string
}) {
  const transactionListItem = import.meta.glob(
    '/../**/apps/wallet/client/src/pages/Transactions/components/TransactionList/components/TransactionItem.tsx',
    { eager: true }
  )[
    '../apps/wallet/client/src/pages/Transactions/components/TransactionList/components/TransactionItem.tsx'
  ]

  if (!transactionListItem || typeof transactionListItem !== 'object') {
    return null
  }

  const TransactionItem = (
    transactionListItem as {
      default: React.ComponentType<{
        transaction: unknown
        viewOnly?: boolean
        className?: string
      }>
    }
  ).default

  return (
    <TransactionItem viewOnly className={className} transaction={transaction} />
  )
}

export default TransactionListItem
