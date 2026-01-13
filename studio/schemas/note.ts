import {ArchiveIcon, DocumentTextIcon, StarIcon} from '@sanity/icons'
import CategoryInput from '../components/CategoryInput'
import NotePreview from '../components/NotePreview'
import CalloutPreview from '../components/CalloutPreview'
import ChecklistPreview from '../components/ChecklistPreview'
import DividerPreview from '../components/DividerPreview'
import EmbedPreview from '../components/EmbedPreview'
import TablePreview from '../components/TablePreview'

/**
 * Note Schema for MY 2ND BRAIN
 * Obsidian-style note with references and backlinks
 */

const note = {
  name: 'note',
  title: 'Note',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'core', title: 'Core'},
    {name: 'meta', title: 'Meta'},
    {name: 'links', title: 'Links'}
  ],
  fieldsets: [
    {
      name: 'taxonomy',
      title: 'Taxonomy',
      options: {columns: 1}
    },
    {
      name: 'flags',
      title: 'Flags',
      options: {columns: 1}
    }
  ],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required().min(1).max(200),
      description: 'The title of your note',
      group: 'core'
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: input => input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .slice(0, 96)
      },
      validation: Rule => Rule.required(),
      description: 'URL-friendly version of the title',
      group: 'core'
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'core',
      options: {
        spellCheck: true
      },
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Lead', value: 'lead' },
            { title: 'Small', value: 'small' },
            { title: 'Caption', value: 'caption' },
            { title: 'Code Title', value: 'code-title' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'H5', value: 'h5' },
            { title: 'H6', value: 'h6' },
            { title: 'Quote', value: 'blockquote' }
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike', value: 'strike-through' },
              { title: 'Code', value: 'code' },
              { title: 'Code Emphasis', value: 'code-strong' },
              { title: 'Code Muted', value: 'code-muted' },
              { title: 'Kbd', value: 'kbd' },
              { title: 'Highlight', value: 'highlight' }
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL'
                  }
                ]
              },
              {
                name: 'internalLink',
                type: 'object',
                title: 'Internal Note Link',
                fields: [
                  {
                    name: 'reference',
                    type: 'reference',
                    to: [{ type: 'note' }]
                  }
                ]
              },
              {
                name: 'fileLink',
                type: 'object',
                title: 'File Link',
                fields: [
                  {
                    name: 'file',
                    type: 'file',
                    title: 'File'
                  },
                  {
                    name: 'label',
                    type: 'string',
                    title: 'Label'
                  }
                ]
              },
              {
                name: 'buttonLink',
                type: 'object',
                title: 'Button',
                fields: [
                  {
                    name: 'label',
                    type: 'string',
                    title: 'Label'
                  },
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL'
                  },
                  {
                    name: 'variant',
                    type: 'string',
                    title: 'Variant',
                    options: {
                      list: [
                        { title: 'Primary', value: 'primary' },
                        { title: 'Secondary', value: 'secondary' }
                      ],
                      layout: 'radio',
                      direction: 'horizontal'
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for accessibility and SEO'
            }
          ]
        },
        {
          type: 'code',
          title: 'Code Block'
        },
        {
          name: 'callout',
          title: 'Callout',
          type: 'object',
          components: {
            preview: CalloutPreview
          },
          fields: [
            {
              name: 'tone',
              title: 'Tone',
              type: 'string',
              options: {
                list: [
                  { title: 'Info', value: 'info' },
                  { title: 'Warning', value: 'warning' },
                  { title: 'Idea', value: 'idea' },
                  { title: 'Note', value: 'note' }
                ],
                layout: 'radio',
                direction: 'horizontal'
              },
              initialValue: 'info'
            },
            {
              name: 'title',
              title: 'Title',
              type: 'string'
            },
            {
              name: 'body',
              title: 'Body',
              type: 'array',
              of: [{ type: 'block' }]
            }
          ]
        },
        {
          name: 'checklist',
          title: 'Checklist',
          type: 'object',
          components: {
            preview: ChecklistPreview
          },
          fields: [
            {
              name: 'items',
              title: 'Items',
              type: 'array',
              of: [
                {
                  name: 'item',
                  title: 'Item',
                  type: 'object',
                  fields: [
                    { name: 'text', title: 'Text', type: 'string' },
                    { name: 'done', title: 'Done', type: 'boolean', initialValue: false }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'table',
          title: 'Table',
          type: 'object',
          components: {
            preview: TablePreview
          },
          fields: [
            {
              name: 'rows',
              title: 'Rows',
              type: 'array',
              of: [
                {
                  name: 'row',
                  title: 'Row',
                  type: 'object',
                  fields: [
                    {
                      name: 'cells',
                      title: 'Cells',
                      type: 'array',
                      of: [{ type: 'string' }]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'embed',
          title: 'Embed',
          type: 'object',
          components: {
            preview: EmbedPreview
          },
          fields: [
            {
              name: 'url',
              title: 'URL',
              type: 'url'
            },
            {
              name: 'title',
              title: 'Title',
              type: 'string'
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string'
            }
          ]
        },
        {
          name: 'divider',
          title: 'Divider',
          type: 'object',
          components: {
            preview: DividerPreview
          },
          fields: [
            {
              name: 'style',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Solid', value: 'solid' },
                  { title: 'Dashed', value: 'dashed' }
                ],
                layout: 'radio',
                direction: 'horizontal'
              },
              initialValue: 'solid'
            }
          ]
        }
      ],
      description: 'The main content of your note'
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      },
      description: 'Tags to categorize this note',
      group: 'meta',
      fieldset: 'taxonomy'
    },
    {
      name: 'references',
      title: 'References',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'note' }]
        }
      ],
      description: 'Other notes this note references (Obsidian-style links)',
      group: 'links'
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      components: {
        input: CategoryInput
      },
      options: {
        list: [
          { title: 'Development', value: 'development' },
          { title: 'Design', value: 'design' },
          { title: 'Learning', value: 'learning' },
          { title: 'Ideas', value: 'ideas' },
          { title: 'Other', value: 'other' }
        ],
        layout: 'radio',
        direction: 'horizontal'
      },
      description: 'Primary category for this note',
      group: 'meta',
      fieldset: 'taxonomy'
    },
    {
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      description: 'Display this note prominently on the homepage',
      initialValue: false,
      group: 'meta',
      fieldset: 'flags'
    },
    {
      name: 'isFavorite',
      title: 'Favorite',
      type: 'boolean',
      icon: StarIcon,
      description: 'Mark this note as a favorite',
      initialValue: false,
      group: 'meta',
      fieldset: 'flags'
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      icon: ArchiveIcon,
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Archived', value: 'archived' }
        ],
        layout: 'radio',
        direction: 'horizontal'
      },
      description: 'Content status for filtering',
      initialValue: 'active',
      group: 'meta',
      fieldset: 'flags'
    }
  ],
  preview: {
    select: {
      title: 'title',
      tags: 'tags',
      category: 'category',
      isFavorite: 'isFavorite',
      status: 'status'
    },
    prepare(selection) {
      const { title, tags, category, isFavorite, status } = selection;
      const tagsCount = Array.isArray(tags) ? tags.length : 0;
      const statusLabel = status === 'archived' ? 'Archived' : 'Active';
      const tagsLabel = tags ? `${tags.length} tags` : 'No tags';
      const favoriteLabel = isFavorite ? 'Favorite' : '';
      return {
        title: title,
        category: category,
        status: status,
        isFavorite: isFavorite,
        tagsCount: tagsCount,
        subtitle: [category || 'Uncategorized', statusLabel, tagsLabel, favoriteLabel].filter(Boolean).join(' - ')
      };
    }
  },
  components: {
    preview: NotePreview
  },
  orderings: [
    {
      title: 'Created Date, New',
      name: 'createdDesc',
      by: [
        { field: '_createdAt', direction: 'desc' }
      ]
    },
    {
      title: 'Created Date, Old',
      name: 'createdAsc',
      by: [
        { field: '_createdAt', direction: 'asc' }
      ]
    },
    {
      title: 'Title, A-Z',
      name: 'titleAsc',
      by: [
        { field: 'title', direction: 'asc' }
      ]
    },
    {
      title: 'Title, Z-A',
      name: 'titleDesc',
      by: [
        { field: 'title', direction: 'desc' }
      ]
    }
  ]
}

export default note
