import { LitElement, html, customElement, property, CSSResultArray, TemplateResult, css } from 'lit-element';
import {
  HomeAssistant,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
  LovelaceCard,
} from 'custom-card-helpers';

import './tadothermostat-card-editor';
import { infotoconsole, cctoconsole } from './modules/card_information';
import { TadothermostatCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { localize } from './localize/localize';
import style from './css/styles.scss';

infotoconsole();
cctoconsole();

// TODO Name your custom element
@customElement('tadothermostat-card')
export class TadothermostatCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('tadothermostat-card-editor') as LovelaceCardEditor;
  }
  public static getStubConfig(): object {
    return {};
  }
  // Cause element to re-render
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) private _config!: TadothermostatCardConfig;

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
        class="ha-card ${mode_class}"
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config.hold_action),
          hasDoubleClick: hasAction(this._config.double_tap_action),
        })}
        tabindex="0"
        aria-label=${`Tadothermostat: ${this._config.entity}`}
      >
        <div class="ha-card-body">
          <div class="placement bg-svgicon">
            ${mode_icon}
          </div>
          <div class="placement fg">
            <div class="fg-temp">
              <!-- <p>testing works</p> -->
              ${this.parseClimateTempRound()}
            </div>
            <div class="fg-text fg-location">${this._getAttributeValueForKey('friendly_name')}</div>
            <div class="fg-text fg-mode">${mode_text}</div>
          </div>
        </div>
      </ha-card>
    `;
  }

  private parseClimateValues(): [string, string, TemplateResult] {
    const target_temperature = this._getAttributeValueForKey('temperature');
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
      setpoint = setpoint + target_temperature.toString().split('.')[0];
      mode_text = `Heating to ${target_temperature}°`;
      mode_class = 'heating ' + setpoint;
      mode_icon = html``;
    }
    if (hvac_action == 'idle') {
      let setpoint = 'setpoint-';
      setpoint = setpoint + target_temperature.toString().split('.')[0];
      mode_text = `Set to ${target_temperature}°`;
      mode_class = 'idle ' + setpoint;
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
        tempint = parseInt(tempstr);
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
        tempint = parseInt(tempstr);
        if (isNaN(tempint)) {
          tempint = 0;
        }
      } catch (Error) {
        console.log(Error.message);
      }
      return tempint;
    }
  }
  private parseClimateTempRound(): TemplateResult {
    let tempsmall = 0,
      tempsmallstr = '',
      templarge = 0,
      templargestr = '',
      decimel = true,
      tempstr: string[];

    const current_temperature = this._getAttributeValueForKey('current_temperature');

    try {
      tempstr = current_temperature.toString().split('.');
      templarge = parseInt(tempstr[0]);
      tempsmall = parseInt(tempstr[1]);
      if (isNaN(tempsmall)) {
        tempsmall = 0;
      }
    } catch (Error) {
      console.log(Error.message);
    }
    if (tempsmall >= 7) {
      templarge = templarge + 1;
      decimel = false;
    }
    if (tempsmall <= 3) {
      // tempsmall = 0;
      decimel = false;
    }
    if (decimel) {
      tempsmallstr = tempsmall.toString();
    } else {
      tempsmallstr = '';
    }
    templargestr = templarge.toString();
    return html`
      <div class="temp-large">${templargestr}</div>
      <div class="temp-degree"><span>&deg;</span></div>
      <div class="temp-small">${tempsmallstr}</div>
    `;
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
      <svg class="svg_logo" viewBox="0 0 83 56">
        <path
          fill-rule="evenodd"
          d="M58.21 13.81l.007-.007a2.754 2.754 0 0 1 3.894.007 2.774 2.774 0 0 1 0 3.916L46.104 33.794a1 1 0 0 0 0 1.412l16.007 16.068a2.774 2.774 0 0 1-.007 3.923 2.754 2.754 0 0 1-3.894-.007L42.208 39.127l-.002-.003a1 1 0 0 0-1.414.003L24.79 55.19a2.753 2.753 0 0 1-3.9 0 2.774 2.774 0 0 1 0-3.916l16.007-16.068a1 1 0 0 0 0-1.412L20.89 17.726a2.774 2.774 0 0 1 .007-3.924 2.753 2.753 0 0 1 3.893.008l16.002 16.063.002.003a1 1 0 0 0 1.414-.003L58.21 13.81zM0 34.486a2.498 2.498 0 0 1 2.498-2.499h28.088a1 1 0 0 1 .707.293l1.5 1.498a1 1 0 0 1 0 1.415l-1.5 1.498a1 1 0 0 1-.707.293H2.498A2.498 2.498 0 0 1 0 34.486zm51.707-2.204a1 1 0 0 1 .709-.295h28.086a2.498 2.498 0 1 1 0 4.997h-28.09a1 1 0 0 1-.704-.29l-1.5-1.489a1 1 0 0 1-.003-1.414l1.502-1.509z"
        />
      </svg>
    `;
  }
  svg_power_off(): TemplateResult {
    return html`
      <svg class="svg_logo" viewBox="0 0 68 71">
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

  static get styles(): CSSResultArray {
    return [style({ css })];
  }
}
