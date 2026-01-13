import React from 'react'
import {Card, Stack, Text} from '@sanity/ui'
import type {PreviewProps} from 'sanity'

type DividerValue = {
  style?: string
}

const DividerPreview = (props: PreviewProps<DividerValue>) => {
  const style = props.value?.style || 'solid'

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack space={2}>
        <Text weight="semibold">Divider</Text>
        <Text size={1} muted>{style}</Text>
      </Stack>
    </Card>
  )
}

export default DividerPreview
