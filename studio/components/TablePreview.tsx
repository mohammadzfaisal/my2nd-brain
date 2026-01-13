import React from 'react'
import {Card, Stack, Text} from '@sanity/ui'
import type {PreviewProps} from 'sanity'

type TableRow = {
  cells?: string[]
}

type TableValue = {
  rows?: TableRow[]
}

const TablePreview = (props: PreviewProps<TableValue>) => {
  const rows = props.value?.rows || []
  const rowCount = rows.length
  const colCount = rows[0]?.cells?.length || 0

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack space={2}>
        <Text weight="semibold">Table</Text>
        <Text size={1} muted>{rowCount} rows, {colCount} columns</Text>
      </Stack>
    </Card>
  )
}

export default TablePreview
