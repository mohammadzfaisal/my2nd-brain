import React from 'react'
import {Badge, Card, Flex, Stack, Text} from '@sanity/ui'
import type {PreviewProps} from 'sanity'

type NotePreviewValue = {
  title?: string
  category?: string
  status?: string
  isFavorite?: boolean
  tagsCount?: number
}

const NotePreview = (props: PreviewProps<NotePreviewValue>) => {
  const value = props.value || {}
  const title = value.title || 'Untitled'
  const category = value.category || 'Uncategorized'
  const status = value.status === 'archived' ? 'Archived' : 'Active'
  const tagsLabel = typeof value.tagsCount === 'number' && value.tagsCount > 0
    ? `${value.tagsCount} tags`
    : 'No tags'

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack space={3}>
        <Text weight="semibold">{title}</Text>
        <Flex gap={2} wrap="wrap">
          <Badge tone="primary">{category}</Badge>
          <Badge tone={value.status === 'archived' ? 'caution' : 'positive'}>{status}</Badge>
          <Badge tone="default">{tagsLabel}</Badge>
          {value.isFavorite ? <Badge tone="warning">Favorite</Badge> : null}
        </Flex>
      </Stack>
    </Card>
  )
}

export default NotePreview
