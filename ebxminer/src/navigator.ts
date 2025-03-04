let nav: Navigator;

export function overrideNavigator(navigator: Navigator) {
  nav = navigator;
}

export function getNavigator() {
  return nav || navigator;
}
