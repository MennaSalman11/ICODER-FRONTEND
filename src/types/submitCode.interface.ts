export interface SubmitCodeResponse {
  totalElements: number
  totalPages: number
  pageable: Pageable
  size: number
  content: Content[]
  number: number
  sort: Sort2
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface Pageable {
  paged: boolean
  pageNumber: number
  pageSize: number
  offset: number
  sort: Sort
  unpaged: boolean
}

export interface Sort {
  sorted: boolean
  empty: boolean
  unsorted: boolean
}

export interface Content {
  id: number
  userHandle: string
  userId: number
  onlineJudge: string
  problemCode: string
  verdict: string
  language: string
  timeUsage: string
  memoryUsage: string
  submittedAt: string
  isOpen: boolean
  remoteRunId: string
}

export interface Sort2 {
  sorted: boolean
  empty: boolean
  unsorted: boolean
}
