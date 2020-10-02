import { CARD_VERSION, CARD_NAME, CARD_FRIENDLY_NAME, CARD_DESC } from '../const';

export function infotoconsole(): void {
  console.info(
    `%c  ${CARD_NAME.toUpperCase()}  \n%c  Version ${CARD_VERSION}    `,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',
  );
}

export function cctoconsole(): void {
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: CARD_NAME,
    name: CARD_FRIENDLY_NAME,
    description: CARD_DESC,
  });
}
