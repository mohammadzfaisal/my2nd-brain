import React from 'react'
import {Card, Stack, Text} from '@sanity/ui'
import type {PreviewProps} from 'sanity'

type ChecklistItem = {
  text?: string
  done?: boolean
}

type ChecklistValue = {
  items?: ChecklistItem[]
}

const ChecklistPreview = (props: PreviewProps<ChecklistValue>) => {
  const items = props.value?.items || []
  const total = items.length
  const done = items.filter((item) => item.done).length
  const previewItems = items.slice(0, 3)

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack space={2}>
        <Text weight="semibold">Checklist</Text>
        <Text size={1} muted>{done} of {total} done</Text>
        {previewItems.map((item, index) => (
          <Text key={index} size={1}>
            {item.done ? '[x]' : '[ ]'} {item.text || 'Untitled'}
          </Text>
        ))}
      </Stack>
    </Card>
  )
}

export default ChecklistPreview
