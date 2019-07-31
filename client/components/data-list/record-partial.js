import { LitElement, html, css } from 'lit-element'

// TODO 로케일 설정에 따라서 포맷이 바뀌도록 해야한다.
const OPTIONS = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false
  // timeZone: 'America/Los_Angeles'
}

const formatter = new Intl.DateTimeFormat(navigator.language, OPTIONS)

export class RecordPartial extends LitElement {
  static get properties() {
    return {
      record: Object
    }
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;
          padding: var(--data-list-item-padding);
          border-bottom: var(--data-list-item-border-bottom);
        }

        div {
          padding-top: 3px;
        }

        .name {
          font: var(--data-list-item-name-font);
          color: var(--data-list-item-name-color);
          text-transform: capitalize;
        }

        .desc {
          font: var(--data-list-item-disc-font);
          color: var(--data-list-item-disc-color);
        }

        .update-info {
          font: var(--data-list-item-etc-font);
          color: var(--data-list-item-etc-color);
        }

        .update-info mwc-icon {
          vertical-align: middle;
          font-size: 1em;
        }
      `
    ]
  }

  render() {
    var record = this.record || {}

    return html`
      <div class="name">&nbsp;${record.name}</div>
      <div class="desc">&nbsp;${record.description}</div>
      ${record.updatedAt
        ? html`
            <div class="update-info">
              <mwc-icon>access_time</mwc-icon> Updated At : ${formatter.format(new Date(Number(record.updatedAt)))} /
              ${record.updaterId}
            </div>
          `
        : ``}
    `
  }
}

customElements.define('record-partial', RecordPartial)