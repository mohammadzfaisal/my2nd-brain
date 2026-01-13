import React from 'react'
import {Button, Flex, Stack, Text} from '@sanity/ui'
import {set, unset} from 'sanity'
import type {StringInputProps} from 'sanity'

type ListOption = {
  title: string
  value: string
}

const CategoryInput = (props: StringInputProps) => {
  const {value, onChange, schemaType} = props
  const options = Array.isArray(schemaType?.options?.list)
    ? (schemaType.options.list as ListOption[])
    : []

  return (
    <Stack space={3}>
      <Flex gap={2} wrap="wrap">
        {options.map((option) => {
          const isActive = value === option.value
          return (
            <Button
              key={option.value}
              mode={isActive ? 'default' : 'ghost'}
              tone={isActive ? 'primary' : 'default'}
              type="button"
              onClick={() => onChange(isActive ? unset() : set(option.value))}
            >
              {option.title}
            </Button>
          )
        })}
      </Flex>
      <Text size={1} muted>
        Select one primary category.
      </Text>
    </Stack>
  )
}

export default CategoryInput
