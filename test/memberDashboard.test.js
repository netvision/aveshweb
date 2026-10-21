// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import axios from 'axios'
import Distributor from '../src/components/Distributor.vue'
import Retailer from '../src/components/Retailer.vue'

vi.mock('axios', () => ({ default: { get: vi.fn() } }))

describe('member dashboard rendering', () => {
  beforeEach(() => {
    localStorage.setItem('aveshToken', 'test-token')
    axios.get.mockResolvedValue({ data: [] })
  })

  afterEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it.each([
    ['distributor', Distributor, 1],
    ['retailer', Retailer, 2],
    ['electrician', Retailer, 3],
  ])('renders the %s dashboard with a token', (_role, component, type) => {
    const wrapper = shallowMount(component, {
      props: { member: { id: 12, type, full_name: 'Member', firm_title: 'Test Firm' } },
      global: { stubs: { DocumentCopy: true, CirclePlus: true, Memo: true } },
    })

    expect(wrapper.text()).toContain('Test Firm')
  })
})
