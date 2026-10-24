const assets = {
  brand: 'e6d5b',
  sparkle: '15741',
  pin: '42e2a',
  locate: '319ad',
  package: '7f7ee',
  helmet: '62bf4',
  checked: 'f32ce',
  circle: '01f73',
  clock: '11564',
  down: '8c45e',
  arrow: 'c882b',
  calendar: '0dad8',
  info: '26562',
  bike: '5a649',
  saved: 'd213a',
  check: '67f00',
  spinner: '0ef3f',
  dots: '0a595',
  back: '60d5d',
  error: 'd9349',
  unavailable: '2fcdb',
  blocked: '169dc',
  retry: '3515f',
  edit: 'e9ef1',
  stepPin: 'abd02',
  stepClock: '962c9',
  stepSparkle: 'c34c9',
  previewSparkle: '58cc4',
} as const
const mobileAssets: Partial<Record<keyof typeof assets, string>> = {
  brand: 'a90b9',
  sparkle: 'ac455',
  pin: '376ec',
  locate: 'ee3ac',
  package: '5115b',
  helmet: '0fe2e',
  checked: '49d6f',
  circle: 'c49bf',
  clock: '52d4b',
  down: 'e2265',
  arrow: 'b6576',
  calendar: '8c193',
  info: 'eb509',
}
export function Icon({
  name,
  className = '',
}: {
  name: keyof typeof assets
  className?: string
}) {
  return (
    <span className={`icon icon-${name} ${className}`} aria-hidden="true">
      <picture>
        {mobileAssets[name] && (
          <source
            media="(max-width: 600px)"
            srcSet={`/assets/${mobileAssets[name]}.svg`}
          />
        )}
        <img src={`/assets/${assets[name]}.svg`} alt="" />
      </picture>
    </span>
  )
}
