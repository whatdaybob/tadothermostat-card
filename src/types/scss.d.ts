declare module '*.scss' {
  import { css, CSSResult } from 'lit-element';
  const scss: (params: { css: typeof css }) => CSSResult;
  export default scss;
}
