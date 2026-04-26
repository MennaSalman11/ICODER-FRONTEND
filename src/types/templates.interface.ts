export interface Template {
  content: TemplateContent[]
  pageable: Pageable
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: TemplateSort2
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface TemplateContent {
  template_id: string
  template_name: string
  language_id: number
  code: string
  enabled: boolean
  created_and_updated_at: string
  monaco_name: string
}

export interface Pageable {
  pageNumber: number
  pageSize: number
  sort: TemplateSort
  offset: number
  paged: boolean
  unpaged: boolean
}

export interface TemplateSort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface TemplateSort2 {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}
