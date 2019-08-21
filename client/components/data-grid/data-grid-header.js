import { LitElement, html, css } from 'lit-element'
import throttle from 'lodash/throttle'

class DataGridHeader extends LitElement {
  static get properties() {
    return {
      config: Object,
      columns: Array,
      data: Object,
      _sorters: Array
    }
  }

  static get styles() {
    return [
      css`
        :host {
          display: grid;
          grid-template-columns: var(--grid-template-columns);

          overflow: hidden;
        }

        div {
          display: flex;

          white-space: nowrap;
          overflow: hidden;
          background-color: var(--grid-header-background-color, gray);
          border: 1px solid var(--grid-header-border-color);
          border-width: 1px 0;
          border-left: 1px solid rgba(255, 255, 255, 0.6);
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          padding: 5px 0;

          text-overflow: ellipsis;
          text-align: center;
          font-size: var(--grid-header-fontsize, 1em);
          color: var(--grid-header-color, white);
        }

        span {
          white-space: nowrap;
          overflow: hidden;

          text-align: center;
        }

        span[title] {
          flex: 1;
          text-overflow: ellipsis;
          font: var(--grid-header-font);
          color: var(--grid-header-color);
          text-transform: capitalize;
        }

        span[sorter] {
          padding: 0;
          border: 0;
          font-size: 10px;
        }

        span[splitter] {
          cursor: col-resize;
        }
      `
    ]
  }

  _onWheelEvent(e) {
    var delta = Math.max(-1, Math.min(1, e.deltaY || 0))
    this.scrollLeft = Math.max(0, this.scrollLeft - delta * 40)

    e.preventDefault()
  }

  firstUpdated() {
    this.addEventListener('wheel', this._onWheelEvent.bind(this), false)
  }

  updated(changed) {
    if (changed.has('config')) {
      this._sorters = this.config.sorters || []
    }
  }

  render() {
    var columns = this.columns || []

    return html`
      ${columns.map((column, idx) =>
        !column.hidden
          ? html`
              <div @dragstart=${e => this._dragStart(e, idx)}>
                <span title @click=${e => this._changeSort(column)}>${this._renderHeader(column)} </span>

                ${column.sortable
                  ? html`
                      <span sorter @click=${e => this._changeSort(column)}>
                        ${this._renderSortHeader(column)}
                      </span>
                    `
                  : html``}
                ${column.resizable !== false
                  ? html`
                      <span splitter draggable="true">&nbsp;</span>
                    `
                  : html``}
              </div>
            `
          : html``
      )}

      <div></div>
    `
  }

  _renderHeader(column) {
    var { renderer } = column.header
    var title = renderer.call(this, column)

    return html`
      ${title}
    `
  }

  _renderSortHeader(column) {
    if (column.hidden) {
      return html``
    }

    var sorters = this._sorters || []

    var sorter = sorters.find(sorter => column.type !== 'gutter' && column.name == sorter.name)
    if (!sorter) {
      return html``
    }

    if (sorters.length > 1) {
      var rank = sorters.indexOf(sorter) + 1
      return sorter.descending
        ? html`
            &#9650;<sub>${rank}</sub>
          `
        : html`
            &#9660;<sub>${rank}</sub>
          `
    } else {
      return sorter.descending
        ? html`
            &#9650;
          `
        : html`
            &#9660;
          `
    }
  }

  _changeSort(column) {
    if (!column.sortable) {
      return
    }

    var sorters = [...(this._sorters || [])]

    var idx = sorters.findIndex(sorter => sorter.name == column.name)
    if (idx !== -1) {
      let sorter = sorters[idx]
      if (sorter.descending) {
        sorters.splice(idx, 1)
      } else {
        sorter.descending = true
      }
    } else {
      var sorter = {
        name: column.name
      }

      sorters.push(sorter)
    }

    this._sorters = sorters

    this.dispatchEvent(
      new CustomEvent('sorters-change', {
        bubbles: true,
        composed: true,
        detail: this._sorters
      })
    )
  }

  _notifyWidthChange(idx, width) {
    if (!this.throttledNotifier) {
      this.throttledNotifier = throttle(function(idx, width) {
        var idx = this.dispatchEvent(
          new CustomEvent('column-width-change', {
            bubbles: true,
            composed: true,
            detail: {
              idx,
              width
            }
          })
        )
      }, 100)
    }

    this.throttledNotifier(idx, width)
  }

  _dragStart(e, idx) {
    var target = e.currentTarget
    var startX = e.offsetX

    var dragHandler = (e => {
      let column = this.columns[idx]

      let width = Math.max(0, Number(column.width) + e.offsetX - startX)
      if (width == 0) {
        /* CLARIFY-ME 왜 마지막 이벤트의 offsetX로 음수 값이 오는가 */
        return
      }

      this._notifyWidthChange(idx, width)
    }).bind(this)

    var dragEndHandler = (e => {
      target.removeEventListener('drag', dragHandler)
      target.removeEventListener('dragend', dragEndHandler)

      dragHandler(e)
    }).bind(this)

    target.addEventListener('drag', dragHandler)
    target.addEventListener('dragend', dragEndHandler)
  }
}

customElements.define('data-grid-header', DataGridHeader)
