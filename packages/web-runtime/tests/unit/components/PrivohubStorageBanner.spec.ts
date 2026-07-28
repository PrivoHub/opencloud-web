import PrivohubStorageBanner from '../../../src/components/PrivohubStorageBanner.vue'
import { defaultPlugins, shallowMount } from '@opencloud-eu/web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { SpaceResource } from '@opencloud-eu/web-client'
import { Quota } from '@opencloud-eu/web-client/graph/generated'

const total = 1000

describe('PrivoHub storage banner', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('stays out of the way below the warning threshold', () => {
    const wrapper = getMountedWrapper({ used: 500, total })
    expect(wrapper.find('.privohub-storage-banner').exists()).toBeFalsy()
  })

  it('warns when the plan is nearly used up', () => {
    const wrapper = getMountedWrapper({ used: 950, total })
    const banner = wrapper.find('.privohub-storage-banner')

    expect(banner.exists()).toBeTruthy()
    expect(banner.text()).toContain('95%')
    // Nearing is advisory, so it is dismissible and stays neutral.
    expect(banner.classes()).not.toContain('bg-role-error-container')
    expect(wrapper.find('#privohub-storage-banner-dismiss').exists()).toBeTruthy()
  })

  it('reports a full plan as an error and does not offer to dismiss it', () => {
    const wrapper = getMountedWrapper({ used: total, total })
    const banner = wrapper.find('.privohub-storage-banner')

    expect(banner.exists()).toBeTruthy()
    expect(banner.classes()).toContain('bg-role-error-container')
    expect(wrapper.find('#privohub-storage-banner-dismiss').exists()).toBeFalsy()
  })

  // Usage above the plan is a normal state, not a broken one: ZFS will not
  // accept a refquota below what is already on disk, so a tenant dropped to a
  // smaller plan sits over it until they delete their way back down.
  it('reports usage above the plan as full rather than hiding it', () => {
    const wrapper = getMountedWrapper({ used: total * 2, total })
    expect(wrapper.find('.privohub-storage-banner').classes()).toContain('bg-role-error-container')
  })

  it('says nothing when no quota is applied', () => {
    const wrapper = getMountedWrapper({ used: 500, total: 0 })
    expect(wrapper.find('.privohub-storage-banner').exists()).toBeFalsy()
  })

  it('links to the portal, which is the only place storage can be changed', () => {
    const wrapper = getMountedWrapper({ used: total, total })
    expect(wrapper.find('#privohub-storage-banner-manage').attributes('href')).toEqual(
      'https://privohub.com/portal/storage'
    )
  })

  it('keeps a dismissed warning dismissed for the session', () => {
    sessionStorage.setItem('privohub-storage-banner-dismissed', '1')
    const wrapper = getMountedWrapper({ used: 950, total })
    expect(wrapper.find('.privohub-storage-banner').exists()).toBeFalsy()
  })

  it('shows a full plan even after the warning was dismissed', () => {
    sessionStorage.setItem('privohub-storage-banner-dismissed', '1')
    const wrapper = getMountedWrapper({ used: total, total })
    expect(wrapper.find('.privohub-storage-banner').exists()).toBeTruthy()
  })
})

const getMountedWrapper = (quota: Quota) => {
  return shallowMount(PrivohubStorageBanner, {
    global: {
      renderStubDefaultSlot: true,
      plugins: [
        ...defaultPlugins({
          piniaOptions: {
            spacesState: {
              spaces: [
                mock<SpaceResource>({
                  spaceQuota: quota,
                  isOwner: () => true,
                  driveType: 'personal'
                })
              ]
            }
          }
        })
      ]
    }
  })
}
