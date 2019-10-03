declare namespace JSX {
  type Element = string;
  interface IntrinsicElements {
    [element: string]: {
      [property: string]: any;
    };
  }
}
