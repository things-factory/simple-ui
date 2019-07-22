import { LitElement, html, css } from 'lit-element'

import '@material/mwc-icon'

import { openPopup } from '@things-factory/layout-base'
import './object-selector'

export class ObjectEditor extends LitElement {
  static get properties() {
    return {
      value: Object,
      column: Object,
      record: Object,
      row: Number
    }
  }

  static get styles() {
    return css`
      :host {
        display: flex;
        flex-flow: row nowrap;

        padding: 7px 0px;
        box-sizing: border-box;

        width: 100%;
        height: 100%;

        border: 0;
        background-color: transparent;
      }

      span {
        display: block;
        flex: auto;

        height: 100%;

        text-align: inherit;
        font-size: inherit;
        font-family: inherit;
      }

      mwc-icon {
        width: 20px;
        font-size: 20px;
        vertical-align: middle;
      }
    `
  }

  render() {
    var { idField = 'id', nameField = 'name', descriptionField = 'description' } = this.column.record.options || {}
    var value = this.value || {
      [idField]: '',
      [nameField]: '',
      [descriptionField]: ''
    }

    return html`
      <span>${value[nameField]}(${value[descriptionField]})</span>
      <mwc-icon @click=${this.onclick.bind(this)}>arrow_drop_down</mwc-icon>
    `
  }

  firstUpdated() {
    this.value = this.record[this.column.name]
    this.template = ((this.column.record || {}).options || {}).template
  }

  get icon() {
    return this.shadowRoot.querySelector('mwc-icon')
  }

  select() {}

  focus() {
    this.icon.focus()
  }

  onclick(e) {
    e.stopPropagation()

    if (this.popup) {
      delete this.popup
    }

    const confirmCallback = selected => {
      var after = Object.assign({}, this.record, {
        [this.column.name]: selected
      })

      this.dispatchEvent(
        new CustomEvent('record-change', {
          bubbles: true,
          composed: true,
          detail: {
            before: this.record,
            after,
            row: this.row,
            column: this.column
          }
        })
      )
    }

    var template =
      this.template ||
      html`
        <object-selector
          .value=${this.value.id}
          style="width: 50vw;height: 50vh;"
          .confirmCallback=${confirmCallback.bind(this)}
        ></object-selector>
      `

    this.popup = openPopup(template, {
      backdrop: true
    })
  }
}

customElements.define('object-editor', ObjectEditor)