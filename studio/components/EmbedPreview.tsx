import React from 'react'
import {Badge, Card, Stack, Text} from '@sanity/ui'
import type {PreviewProps} from 'sanity'

type EmbedValue = {
  title?: string
  url?: string
  caption?: string
}

const EmbedPreview = (props: PreviewProps<EmbedValue>) => {
  const value = props.value || {}
  const title = value.title || 'Embed'
  const url = value.url || ''

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack space={2}>
        <Badge tone="primary">Embed</Badge>
        <Text weight="semibold">{title}</Text>
        {url ? <Text size={1} muted>{url}</Text> : null}
        {value.caption ? <Text size={1}>{value.caption}</Text> : null}
      </Stack>
    </Card>
  )
}

export default EmbedPreview
