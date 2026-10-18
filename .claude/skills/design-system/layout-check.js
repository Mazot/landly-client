// Layout check for landly-client screens — paste the whole expression into the
// Browser pane's javascript_tool (javascript_exec) at every viewport you verify.
// Returns a JSON report; a clean screen has pageScrollsHorizontally=false and
// empty arrays. React Query Devtools and Google's map internals are ignored.
(() => {
  const ignore = (el) => el.closest('.tsqd-parent-container, [class*="tsqd-"], .gm-style')
  const vw = document.documentElement.clientWidth
  const coarse = matchMedia('(pointer: coarse)').matches || vw < 1024
  const outside = (el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && (r.right > vw + 1 || r.left < -1)
  }
  const label = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? '#' + el.id : '') +
    (el.classList.length ? '.' + [...el.classList].slice(0, 3).join('.') : '')
  const size = (el) => {
    const r = el.getBoundingClientRect()
    return Math.round(r.width) + 'x' + Math.round(r.height)
  }
  const all = [...document.querySelectorAll('body *')].filter((el) => !ignore(el))

  // Outermost elements sticking out of the viewport (children of an offender are skipped).
  const overflow = all
    .filter((el) => outside(el) && !(el.parentElement && el.parentElement !== document.body && outside(el.parentElement)))
    .filter((el) => getComputedStyle(el).position !== 'fixed' || outside(el))
    .slice(0, 15)
    .map((el) => label(el) + ' right=' + Math.round(el.getBoundingClientRect().right))

  // Interactive elements under 44x44 px (only enforced for touch-sized viewports).
  const interactive = document.querySelectorAll(
    'a[href], button, [role=button], [role=tab], [role=menuitem], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  const smallTapTargets = coarse
    ? [...interactive]
        .filter((el) => {
          if (ignore(el)) return false
          const r = el.getBoundingClientRect()
          return r.width > 0 && (r.width < 44 || r.height < 44)
        })
        .slice(0, 15)
        .map((el) => label(el) + ' ' + size(el))
    : []

  // Visible text below 12px.
  const textUnder12px = all
    .filter(
      (el) =>
        [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) &&
        el.getBoundingClientRect().width > 0 &&
        parseFloat(getComputedStyle(el).fontSize) < 12,
    )
    .slice(0, 10)
    .map(label)

  // iOS Safari zooms into inputs whose font-size is under 16px.
  const inputsUnder16px = coarse
    ? [...document.querySelectorAll('input, select, textarea')]
        .filter((el) => !ignore(el) && parseFloat(getComputedStyle(el).fontSize) < 16)
        .map(label)
    : []

  // Images without alt text (decorative images must use alt="").
  const imagesWithoutAlt = all.filter((el) => el.tagName === 'IMG' && !el.hasAttribute('alt')).map(label)

  return {
    viewport: vw + 'x' + window.innerHeight,
    pageScrollsHorizontally: document.documentElement.scrollWidth > vw,
    overflow,
    smallTapTargets,
    textUnder12px,
    inputsUnder16px,
    imagesWithoutAlt,
  }
})()
