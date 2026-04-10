import { Page, Locator, expect } from '@playwright/test'
import { esperarCarga } from '../utils/waits'

export class GuardiaInteligentePage {

  readonly page: Page
  readonly guardiaInteligenteBtn: Locator

  constructor(page: Page) {
    this.page = page
    this.guardiaInteligenteBtn = page.getByRole('button', { name: /Guardia Inteligente/i })
  }

  async abrirGuardiaInteligente() {

    await this.page.waitForURL('/socio/home', { timeout: 60000 })
    await esperarCarga(this.page)

    await this.page.waitForLoadState('domcontentloaded')

    let elemento = this.guardiaInteligenteBtn

    if (await elemento.count() === 0) {
      elemento = this.page.locator('text=/Guardia Inteligente/i').first()
    }

    await expect(elemento).toBeVisible()

    await Promise.all([
      this.page.waitForURL('/socio/guardia_inteligente', { timeout: 60000 }),
      elemento.click()
    ])

    await esperarCarga(this.page)

    await this.page.waitForTimeout(9000)
  }
}