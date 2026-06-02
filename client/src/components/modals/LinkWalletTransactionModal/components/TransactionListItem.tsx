import React from 'react'

function TransactionListItem({ transaction }: { transaction: unknown }) {
  const transactionListItem = import.meta.glob(
    '/../**/apps/lifeforge--wallet/client/src/pages/Transactions/components/TransactionList/components/TransactionItem.tsx',
    { eager: true }
  )[
    '../apps/lifeforge--wallet/client/src/pages/Transactions/components/TransactionList/components/TransactionItem.tsx'
  ]

  if (!transactionListItem || typeof transactionListItem !== 'object') {
    return null
  }

  const TransactionItem = (
    transactionListItem as {
      default: React.ComponentType<{
        transaction: unknown
        viewOnly?: boolean
      }>
    }
  ).default

  return <TransactionItem viewOnly transaction={transaction} />
}

export default TransactionListItem
