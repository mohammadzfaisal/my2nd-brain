import React from 'react'
import {Badge, Card, Stack, Text} from '@sanity/ui'
import type {PreviewProps} from 'sanity'

type CalloutValue = {
  title?: string
  tone?: string
  body?: Array<{_type?: string; children?: Array<{text?: string}>}>
}

const getText = (blocks?: CalloutValue['body']) => {
  if (!Array.isArray(blocks)) return ''
  for (const block of blocks) {
    if (block && block._type === 'block' && Array.isArray(block.children)) {
      return block.children.map((child) => child.text || '').join('')
    }
  }
  return ''
}

const CalloutPreview = (props: PreviewProps<CalloutValue>) => {
  const value = props.value || {}
  const title = value.title || 'Callout'
  const tone = value.tone || 'info'
  const summary = getText(value.body)

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack space={2}>
        <Badge tone="primary">{tone}</Badge>
        <Text weight="semibold">{title}</Text>
        {summary ? <Text size={1} muted>{summary}</Text> : null}
      </Stack>
    </Card>
  )
}

export default CalloutPreview
