export function quotePresentation(config = {}, isDemo = false) {
  const live = !isDemo && config.quoteMode === 'live';
  const preview = config.quoteMode === 'preview';
  return { live, preview, available: live || preview };
}
