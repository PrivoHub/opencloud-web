import PlainShell from '../../../src/components/PlainShell.vue'
import { defaultPlugins, shallowMount } from '@opencloud-eu/web-test-helpers'
import { ThemeConfig, WebThemeType } from '@opencloud-eu/web-pkg'

describe('PlainShell', () => {
  it('shows logoPlain when the theme sets it', () => {
    const { wrapper } = getWrapper({
      logo: 'themes/test/logo-on-topbar.svg',
      logoPlain: 'themes/test/logo-on-surface.svg'
    })
    expect(wrapper.find('img').attributes('src')).toContain('themes/test/logo-on-surface.svg')
  })

  it('falls back to logo without logoPlain', () => {
    const { wrapper } = getWrapper({ logo: 'themes/test/logo-on-topbar.svg' })
    expect(wrapper.find('img').attributes('src')).toContain('themes/test/logo-on-topbar.svg')
  })

  it('keeps logoPlain when parsing a theme config', () => {
    const parsed = ThemeConfig.parse({
      clients: {
        web: {
          defaults: { logoPlain: 'a.svg' },
          themes: [{ isDark: false, label: 'Light', logoPlain: 'b.svg' }]
        }
      }
    })
    expect(parsed.clients.web.defaults.logoPlain).toBe('a.svg')
    expect(parsed.clients.web.themes[0].logoPlain).toBe('b.svg')
  })
})

function getWrapper(currentTheme: Partial<WebThemeType>) {
  return {
    wrapper: shallowMount(PlainShell, {
      props: { title: 'Test' },
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: { themeState: { currentTheme: currentTheme as WebThemeType } }
          })
        ]
      }
    })
  }
}
