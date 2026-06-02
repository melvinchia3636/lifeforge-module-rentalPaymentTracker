import { Flex, Text, type FlexProps } from '@lifeforge/ui'

import numberToCurrency from '@/utils/numberToCurrency'

function Amount({
  amount,
  display
}: {
  amount: number
  display?: FlexProps['display']
}) {
  return (
    <Flex align="end" as="p" display={display}>
      <Text color="muted" mr="sm" size="xl">
        RM
      </Text>
      <Flex asChild maxWidth="100%">
        <Text truncate size="5xl" weight="medium">
          {numberToCurrency(amount)}
        </Text>
      </Flex>
    </Flex>
  )
}

export default Amount
