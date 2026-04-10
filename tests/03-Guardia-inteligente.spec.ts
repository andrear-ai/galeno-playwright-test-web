import { Page, Locator, expect } from '@playwright/test'
import { esperarCarga } from '../utils/waits'

export class GuardiaInteligentePage {

  readonly page: Page
  readonly guardiaInteligenteBtn: Locator

  constructor(page: Page) {
    this.page = page

    // Buscar el botón por nombre (puede ser button o algún otro elemento)
    this.guardiaInteligenteBtn = page.getByRole('button', { name: /Guardia Inteligente/i })
  }

  async abrirGuardiaInteligente() {

    // Esperar a que la home está cargada
    await this.page.waitForURL('/socio/home', { timeout: 60000 })
    await esperarCarga(this.page)

    // Esperar a que el menú lateral esté disponible
    await this.page.waitForLoadState('domcontentloaded')

    // Si no encuentra como button, intenta como elemento de texto
    let elemento = this.guardiaInteligenteBtn

    if (await elemento.count() === 0) {
      elemento = this.page.locator('text=/Guardia Inteligente/i').first()
    }

    // Verificar que el elemento existe y es visible
    await expect(elemento).toBeVisible()

    // Hacer click y esperar a que cargue la página de Guardia Inteligente
    await Promise.all([
      this.page.waitForURL('/socio/guardia_inteligente', { timeout: 60000 }),
      elemento.click()
    ])

    // Esperar a que termine de cargar
    await esperarCarga(this.page)

    // Esperar alguns segundos para verificar que llegó a la pantalla deseada
    await this.page.waitForTimeout(9000)
  }
}