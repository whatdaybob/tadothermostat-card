import {
  LitElement,
  html,
  customElement,
  property,
  CSSResult,
  TemplateResult,
  css,
  /* PropertyValues */
} from 'lit-element';
import {
  HomeAssistant,
  // hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
  LovelaceCard,
} from 'custom-card-helpers';

import './tadothermostat-card-editor';

import { TadothermostatCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { MAIN_CARD_VERSION } from './const';
import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  TADOTHERMOSTAT-CARD \n%c  ${localize('common.version')} ${MAIN_CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).customCards = (window as any).customCards || [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).customCards.push({
  type: 'tadothermostat-card',
  name: 'Tadothermostat Card',
  description: 'A template custom card for you to create something awesome',
});

// TODO Name your custom element
@customElement('tadothermostat-card')
export class TadothermostatCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('tadothermostat-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return {};
  }

  // Add any properities that should cause your element to re-render here
  @property() public hass!: HomeAssistant;
  @property() private _config!: TadothermostatCardConfig;

  // Add any properities that should not cause your element to re-render here
  private _sensorAvailable = false;

  public setConfig(config: TadothermostatCardConfig): void {
    if (!config.entity) {
      throw new Error('You need to define a single entity');
    }

    if (!config || config.show_error) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this._config = {
      name: 'Tado Thermostat Card',
      ...config,
    };
  }

  protected shouldUpdate(): boolean {
    return true;
  }

  protected render(): TemplateResult | void {
    if (this._config.show_warning) {
      return this.showWarning(localize('common.show_warning'));
    }

    const mode = this.parseClimateValues();
    const mode_text = mode[0];
    const mode_class = mode[1];
    const mode_icon = mode[2];

    return html`
      <ha-card
        class="${mode_class}"
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config.hold_action),
          hasDoubleClick: hasAction(this._config.double_tap_action),
        })}
        tabindex="0"
        aria-label=${`Tadothermostat: ${this._config.entity}`}
      >
        <div class="ha-card-body">
          <div class="bg-svgicon-placement">
            ${mode_icon}
          </div>
          <div class="fg-placement" style="z-index: 1; position: absolute; bottom: 10px; left: 16px; right: 16px;">
            <div class="fg-temp">
              <div class="temp-large">${this.parseClimateTemp('large')}</div>
              <div class="temp-degree"><span>&deg;</span></div>
              <div class="temp-small">${this.parseClimateTemp('small')}</div>
            </div>
            <div class="fg-text fg-location">${this._getAttributeValueForKey('friendly_name')}</div>
            <div class="fg-text fg-mode">${mode_text}</div>
          </div>
        </div>
      </ha-card>
    `;
  }

  private parseClimateValues(): [string, string, TemplateResult] {
    const temperature = this._getAttributeValueForKey('temperature');
    const min_temp = this._getAttributeValueForKey('min_temp');
    const hvac_action = this._getAttributeValueForKey('hvac_action');
    let mode_text = 'No remote access',
      mode_class = 'disconnected',
      mode_icon: TemplateResult = html`
        ${this.svg_no_remote_access()}
      `;
    if (hvac_action == 'off') {
      if (min_temp == '5') {
        mode_text = 'Frost protection';
      } else {
        mode_text = 'Turned Off';
      }
      mode_class = 'off';
      mode_icon = html`
        ${this.svg_power_off()}
      `;
    }
    if (hvac_action == 'heating') {
      let setpoint = 'setpoint-';
      setpoint = setpoint + temperature.toString().split('.')[0];
      mode_text = `Heating to ${temperature}°`;
      mode_class = 'heating ' + setpoint;
      mode_icon = html``;
    }
    if (hvac_action == 'idle') {
      mode_text = `Set to ${temperature}°`;
      mode_class = 'idle';
      mode_icon = html``;
    }
    return [mode_text, mode_class, mode_icon];
  }

  private parseClimateTemp(temppart: string): number {
    let tempint = 0,
      tempstr = '';
    const current_temperature = this._getAttributeValueForKey('current_temperature');
    if (temppart == 'small') {
      try {
        tempstr = current_temperature.toString().split('.')[1];
        tempint = Number(tempstr);
        if (isNaN(tempint)) {
          tempint = 0;
        }
      } catch (Error) {
        console.log(Error.message);
      }
      return tempint;
    } else {
      try {
        tempstr = current_temperature.toString().split('.')[0];
        tempint = Number(tempstr);
        if (isNaN(tempint)) {
          tempint = 0;
        }
      } catch (Error) {
        console.log(Error.message);
      }
      return tempint;
    }
  }

  private _getAttributeValueForKey(key: string): string {
    if (!this.hass || !this._config) {
      return '';
    }
    const entityId = this._config.entity ? this._config.entity : undefined;
    const stateObj = this._config.entity ? this.hass.states[this._config.entity] : undefined;

    if (!entityId && !stateObj) {
      return '';
    }

    if (stateObj?.attributes == undefined) {
      return '';
    }

    let desired_value = '';
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (key in stateObj?.attributes!) {
      desired_value = stateObj?.attributes[key];
    }
    return desired_value;
  }

  svg_no_remote_access(): TemplateResult {
    return html`
      <svg
        class="svg_logo"
        style="width: 83px; height: 83px; position: absolute; right: 10px; top: -5px; fill: rgb(36, 63, 92);"
        viewBox="0 0 83 56"
      >
        <path
          fill-rule="evenodd"
          d="M58.21 13.81l.007-.007a2.754 2.754 0 0 1 3.894.007 2.774 2.774 0 0 1 0 3.916L46.104 33.794a1 1 0 0 0 0 1.412l16.007 16.068a2.774 2.774 0 0 1-.007 3.923 2.754 2.754 0 0 1-3.894-.007L42.208 39.127l-.002-.003a1 1 0 0 0-1.414.003L24.79 55.19a2.753 2.753 0 0 1-3.9 0 2.774 2.774 0 0 1 0-3.916l16.007-16.068a1 1 0 0 0 0-1.412L20.89 17.726a2.774 2.774 0 0 1 .007-3.924 2.753 2.753 0 0 1 3.893.008l16.002 16.063.002.003a1 1 0 0 0 1.414-.003L58.21 13.81zM0 34.486a2.498 2.498 0 0 1 2.498-2.499h28.088a1 1 0 0 1 .707.293l1.5 1.498a1 1 0 0 1 0 1.415l-1.5 1.498a1 1 0 0 1-.707.293H2.498A2.498 2.498 0 0 1 0 34.486zm51.707-2.204a1 1 0 0 1 .709-.295h28.086a2.498 2.498 0 1 1 0 4.997h-28.09a1 1 0 0 1-.704-.29l-1.5-1.489a1 1 0 0 1-.003-1.414l1.502-1.509z"
        />
      </svg>
    `;
  }
  svg_power_off(): TemplateResult {
    return html`
      <svg
        class="svg_logo"
        style="width: 70px; height: 70px; position: absolute; right: 10px; top: 10px; fill: rgb(104, 131, 150);"
        viewBox="0 0 68 71"
      >
        <g fill-rule="evenodd">
          <path
            d="M34.001 39C36.211 39 38 37.331 38 35.276V3.724C38 1.669 36.21 0 34.001 0 31.791 0 30 1.669 30 3.724v31.552C30 37.331 31.792 39 34.001 39"
          />
          <path
            d="M44.808 9.011a3.788 3.788 0 0 0 1.574 5.142c8.613 4.563 13.964 13.411 13.964 23.09 0 14.423-11.82 26.158-26.346 26.158S7.656 51.666 7.656 37.244c0-9.68 5.349-18.528 13.962-23.091a3.788 3.788 0 0 0 1.574-5.142 3.844 3.844 0 0 0-5.178-1.563C6.902 13.336 0 24.752 0 37.244 0 55.856 15.253 71 34 71s34-15.144 34-33.756c0-12.492-6.902-23.908-18.011-29.796-1.866-.988-4.185-.287-5.181 1.563z"
          />
        </g>
      </svg>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this._config && ev.detail.action) {
      handleAction(this, this.hass, this._config, ev.detail.action);
    }
  }

  private showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card') as LovelaceCard;
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this._config,
    });

    return html`
      ${errorCard}
    `;
  }

  static get styles(): CSSResult {
    return css`
      ha-card {
        /* width: 185px; */
        height: 150px;
        font-family: Helvetica Neue, Arial, sans-serif;
        color: white;
      }
      ha-card *,
      ha-card *:after,
      ha-card *:before {
        box-sizing: border-box;
      }
      .ha-card-body {
        height: 100%;
        padding: 10px 16px;
        position: relative;
        /* box-sizing: border-box; */
      }
      .svg_logo {
        height: 100%;
        width: 100%;
      }
      .fg-temp * {
        display: inline-block;
      }
      .temp-large,
      .temp-degree,
      .temp-small {
        font-weight: 800;
        font-size: 52px;
        line-height: 63px;
      }
      .temp-degree {
        font-weight: lighter;
      }
      .temp-small {
        left: -22px;
        position: relative;
        font-size: 22px;
        line-height: 23px;
      }
      .fg-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .fg-location {
        font-size: 13px;
        line-height: 14px;
      }
      .fg-mode {
        opacity: 0.7;
        font-weight: 500;
        font-size: 11px;
        line-height: 12px;
      }
      .disconnected {
        background: radial-gradient(circle farthest-side at left top, rgba(55, 100, 149, 0.8), rgba(55, 100, 149, 0.5)),
          rgb(36, 63, 92);
      }
      .disconnected .fg-temp {
        display: none;
      }
      .idle {
        background: radial-gradient(circle farthest-side at left top, rgba(68, 198, 120, 0.8), rgba(68, 198, 120, 0.5)),
          rgb(23, 171, 105);
      }
      .heating {
        background: radial-gradient(circle farthest-side at left top, rgba(255, 208, 0, 0.8), rgba(255, 208, 0, 0.5)),
          rgb(255, 187, 0);
      }
      .off {
        background: radial-gradient(
            circle farthest-side at left top,
            rgba(159, 179, 194, 0.8),
            rgba(159, 179, 194, 0.5)
          ),
          rgb(104, 131, 150);
      }
      .setpoint-5 {
        background: radial-gradient(circle farthest-side at left top, rgba(60, 150, 114, 0.8), rgba(60, 150, 114, 0.5)),
          rgb(60, 134, 139);
      }
      .setpoint-6 {
        background: radial-gradient(circle farthest-side at left top, rgba(60, 153, 115, 0.8), rgba(60, 153, 115, 0.5)),
          rgb(57, 139, 142);
      }
      .setpoint-7 {
        background: radial-gradient(circle farthest-side at left top, rgba(60, 158, 116, 0.8), rgba(60, 158, 116, 0.5)),
          rgb(54, 144, 143);
      }
      .setpoint-8 {
        background: radial-gradient(circle farthest-side at left top, rgba(61, 162, 117, 0.8), rgba(61, 162, 117, 0.5)),
          rgb(51, 147, 142);
      }
      .setpoint-9 {
        background: radial-gradient(circle farthest-side at left top, rgba(61, 166, 117, 0.8), rgba(61, 166, 117, 0.5)),
          rgb(48, 149, 140);
      }
      .setpoint-10 {
        background: radial-gradient(circle farthest-side at left top, rgba(61, 170, 118, 0.8), rgba(61, 170, 118, 0.5)),
          rgb(45, 152, 138);
      }
      .setpoint-11 {
        background: radial-gradient(circle farthest-side at left top, rgba(62, 174, 118, 0.8), rgba(62, 174, 118, 0.5)),
          rgb(42, 154, 135);
      }
      .setpoint-12 {
        background: radial-gradient(circle farthest-side at left top, rgba(62, 178, 119, 0.8), rgba(62, 178, 119, 0.5)),
          rgb(40, 157, 132);
      }
      .setpoint-13 {
        background: radial-gradient(circle farthest-side at left top, rgba(62, 182, 119, 0.8), rgba(62, 182, 119, 0.5)),
          rgb(37, 159, 129);
      }
      .setpoint-14 {
        background: radial-gradient(circle farthest-side at left top, rgba(62, 187, 119, 0.8), rgba(62, 187, 119, 0.5)),
          rgb(34, 162, 125);
      }
      .setpoint-15 {
        background: radial-gradient(circle farthest-side at left top, rgba(62, 191, 119, 0.8), rgba(62, 191, 119, 0.5)),
          rgb(31, 164, 120);
      }
      .setpoint-16 {
        background: radial-gradient(circle farthest-side at left top, rgba(63, 194, 119, 0.8), rgba(63, 194, 119, 0.5)),
          rgb(28, 166, 116);
      }
      .setpoint-17 {
        background: radial-gradient(circle farthest-side at left top, rgba(66, 196, 120, 0.8), rgba(66, 196, 120, 0.5)),
          rgb(26, 169, 110);
      }
      .setpoint-18 {
        background: radial-gradient(circle farthest-side at left top, rgba(68, 198, 120, 0.8), rgba(68, 198, 120, 0.5)),
          rgb(23, 171, 105);
      }
      .setpoint-19 {
        background: radial-gradient(circle farthest-side at left top, rgba(255, 208, 0, 0.8), rgba(255, 208, 0, 0.5)),
          rgb(255, 187, 0);
      }
      .setpoint-20 {
        background: radial-gradient(circle farthest-side at left top, rgba(255, 197, 0, 0.8), rgba(255, 197, 0, 0.5)),
          rgb(255, 170, 0);
      }
      .setpoint-21 {
        background: radial-gradient(circle farthest-side at left top, rgba(255, 186, 0, 0.8), rgba(255, 186, 0, 0.5)),
          rgb(255, 153, 0);
      }
      .setpoint-22 {
        background: radial-gradient(circle farthest-side at left top, rgba(255, 174, 0, 0.8), rgba(255, 174, 0, 0.5)),
          rgb(255, 136, 0);
      }
      .setpoint-23 {
        background: radial-gradient(circle farthest-side at left top, rgba(255, 163, 0, 0.8), rgba(255, 163, 0, 0.5)),
          rgb(255, 119, 0);
      }
      .setpoint-24 {
        background: radial-gradient(circle farthest-side at left top, rgba(255, 152, 0, 0.8), rgba(255, 152, 0, 0.5)),
          rgb(255, 102, 0);
      }
      .setpoint-25 {
        background: radial-gradient(circle farthest-side at left top, rgba(255, 140, 0, 0.8), rgba(255, 140, 0, 0.5)),
          rgb(255, 85, 0);
      }
    `;
  }
}
