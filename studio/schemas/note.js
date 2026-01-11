/**
 * Note Schema for MY 2ND BRAIN
 * Obsidian-style note with references and backlinks
 */

export default {
  name: 'note',
  title: 'Note',
  type: 'document',
  icon: () => '📝',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required().min(1).max(200),
      description: 'The title of your note'
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
      description: 'URL-friendly version of the title'
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
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
              { title: 'Code', value: 'code' },
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
      description: 'Tags to categorize this note'
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
      description: 'Other notes this note references (Obsidian-style links)'
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Development', value: 'development' },
          { title: 'Design', value: 'design' },
          { title: 'Learning', value: 'learning' },
          { title: 'Ideas', value: 'ideas' },
          { title: 'Other', value: 'other' }
        ],
        layout: 'radio'
      },
      description: 'Primary category for this note'
    },
    {
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      description: 'Display this note prominently on the homepage',
      initialValue: false
    }
  ],
  preview: {
    select: {
      title: 'title',
      tags: 'tags',
      category: 'category'
    },
    prepare(selection) {
      const { title, tags, category } = selection;
      return {
        title: title,
        subtitle: `${category || 'Uncategorized'} ${tags ? `• ${tags.length} tags` : ''}`
      };
    }
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
};
