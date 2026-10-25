import { useId } from 'react'
import clsx from 'clsx'

// Stylised pastel country shapes, loosely Europe — decoration, not geography.
const BLOBS = [
  { code: 'GB', fill: 'fill-country-1', d: 'M 165 200 C 150 185, 155 165, 175 160 C 195 155, 215 165, 220 185 C 225 205, 215 235, 200 250 C 185 260, 165 255, 160 240 C 155 225, 158 210, 165 200 Z' },
  { code: 'FR', fill: 'fill-country-2', d: 'M 250 295 C 240 280, 250 255, 275 250 C 305 247, 340 260, 350 285 C 360 315, 345 350, 320 365 C 295 372, 265 365, 255 345 C 248 325, 250 305, 250 295 Z' },
  { code: 'ES', fill: 'fill-country-3', d: 'M 195 385 C 180 372, 185 350, 210 345 C 245 340, 285 350, 295 375 C 300 400, 285 425, 255 432 C 225 437, 200 425, 195 405 Z' },
  { code: 'PT', fill: 'fill-country-7', d: 'M 175 385 C 168 380, 165 360, 175 350 C 188 345, 195 360, 195 380 C 195 405, 190 425, 180 430 C 168 432, 165 415, 168 400 Z' },
  { code: 'DE', fill: 'fill-country-4', d: 'M 380 245 C 370 225, 380 210, 405 205 C 435 200, 460 215, 465 240 C 470 270, 460 295, 435 305 C 410 312, 390 300, 382 280 C 378 265, 378 255, 380 245 Z' },
  { code: 'IT', fill: 'fill-country-5', d: 'M 410 320 C 405 310, 415 295, 435 295 C 455 295, 465 315, 460 340 C 455 365, 445 395, 430 415 C 420 430, 405 432, 400 420 C 398 405, 405 380, 412 365 C 415 350, 408 335, 410 320 Z' },
  { code: 'PL', fill: 'fill-country-6', d: 'M 480 230 C 475 215, 490 200, 520 200 C 555 200, 575 215, 575 240 C 575 265, 555 285, 525 285 C 500 285, 485 270, 480 250 Z' },
  { code: 'UA', fill: 'fill-country-2', d: 'M 590 245 C 585 230, 605 215, 640 215 C 685 215, 720 230, 725 260 C 730 290, 710 315, 670 320 C 635 322, 605 310, 595 290 C 590 275, 590 255, 590 245 Z' },
  { code: 'BY', fill: 'fill-country-3', d: 'M 590 215 C 585 200, 605 188, 635 190 C 660 192, 678 205, 678 222 C 675 235, 660 245, 635 245 C 615 245, 595 235, 590 220 Z' },
  { code: 'RU', fill: 'fill-country-1', d: 'M 590 175 C 600 145, 670 130, 760 135 C 850 138, 920 155, 935 185 C 950 215, 920 235, 850 235 C 790 235, 720 225, 680 215 C 640 207, 605 200, 590 188 Z' },
  { code: 'TR', fill: 'fill-country-4', d: 'M 580 375 C 575 360, 600 345, 645 345 C 690 345, 730 355, 740 380 C 745 400, 725 420, 685 425 C 645 428, 605 420, 590 405 C 583 395, 580 385, 580 375 Z' },
  { code: 'GR', fill: 'fill-country-6', d: 'M 520 380 C 510 370, 520 355, 545 352 C 570 352, 580 365, 575 385 C 570 405, 555 420, 540 422 C 525 420, 515 408, 515 395 Z' },
  { code: 'RS', fill: 'fill-country-5', d: 'M 490 330 C 485 320, 500 308, 525 308 C 550 310, 560 325, 555 345 C 550 360, 535 365, 515 360 C 498 355, 488 345, 490 330 Z' },
  { code: 'CZ', fill: 'fill-country-7', d: 'M 460 270 C 455 260, 475 250, 500 252 C 520 254, 525 268, 518 280 C 510 290, 488 290, 470 285 C 462 280, 458 275, 460 270 Z' },
  { code: 'AT', fill: 'fill-country-3', d: 'M 445 295 C 440 287, 455 280, 480 280 C 505 282, 515 295, 510 305 C 500 312, 475 312, 458 308 C 448 305, 442 300, 445 295 Z' },
  { code: 'NL', fill: 'fill-country-5', d: 'M 360 215 C 355 207, 365 200, 380 200 C 395 200, 405 210, 400 225 C 395 235, 378 240, 365 235 C 358 230, 357 220, 360 215 Z' },
  { code: 'BE', fill: 'fill-country-6', d: 'M 345 240 C 340 232, 348 225, 365 226 C 380 228, 388 238, 382 248 C 375 256, 360 256, 350 252 C 343 248, 343 244, 345 240 Z' },
  { code: 'GE', fill: 'fill-country-4', d: 'M 780 295 C 775 285, 800 278, 830 282 C 855 286, 862 298, 855 308 C 845 315, 818 315, 798 310 C 785 306, 778 300, 780 295 Z' },
  { code: 'AM', fill: 'fill-country-6', d: 'M 805 322 C 800 315, 815 310, 832 312 C 848 315, 853 325, 845 332 C 835 338, 818 336, 808 332 C 802 328, 802 325, 805 322 Z' },
  { code: 'AZ', fill: 'fill-country-2', d: 'M 855 320 C 850 312, 870 305, 895 308 C 915 312, 920 322, 912 330 C 902 336, 880 336, 865 332 C 856 328, 853 324, 855 320 Z' },
  { code: 'FI', fill: 'fill-country-5', d: 'M 545 100 C 540 80, 560 60, 590 60 C 620 60, 635 80, 630 110 C 625 140, 610 165, 590 170 C 570 170, 555 150, 548 130 C 545 115, 545 105, 545 100 Z' },
  { code: 'SE', fill: 'fill-country-7', d: 'M 480 95 C 475 75, 495 55, 520 55 C 545 55, 555 75, 552 105 C 548 135, 535 165, 515 175 C 498 178, 485 158, 482 135 C 480 115, 478 100, 480 95 Z' },
  { code: 'NO', fill: 'fill-country-3', d: 'M 410 95 C 405 75, 425 55, 450 55 C 475 55, 485 75, 482 105 C 478 135, 465 165, 445 178 C 425 180, 410 160, 408 135 C 405 115, 408 100, 410 95 Z' },
] as const

export interface MapBackdropProps {
  /** Destination country (terracotta). Codes are the blob codes above. */
  highlight?: string
  /** Home country (blue). */
  origin?: string
  /**
   * `plain` — the map as is; `hero` — dimmed below `lg`, and from `lg` a fade
   * to the page background on the left so text on top stays readable.
   */
  variant?: 'plain' | 'hero'
  className?: string
}

/** Decorative pastel map for the landing and sign-in screens (`aria-hidden`). */
export function MapBackdrop({ highlight = 'DE', origin = 'RU', variant = 'plain', className }: MapBackdropProps) {
  const dots = useId()
  return (
    <div aria-hidden className={clsx('overflow-hidden bg-country-water', className)}>
      <div className="relative size-full">
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className={clsx('block size-full', variant === 'hero' && 'opacity-55 lg:opacity-100')}>
          <defs>
            <pattern id={dots} width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.6" className="fill-ink-3/20" />
            </pattern>
          </defs>
          <rect width="1000" height="600" fill={`url(#${dots})`} />
          {BLOBS.map((blob) => {
            const tone = blob.code === highlight ? 'fill-accent-soft stroke-accent' : blob.code === origin ? 'fill-type-embassy-soft stroke-type-embassy' : `${blob.fill} stroke-ink-3/25`
            return <path key={blob.code} d={blob.d} strokeWidth={blob.code === highlight || blob.code === origin ? 1.5 : 0.6} className={tone} />
          })}
        </svg>
        {variant === 'hero' && <div className="absolute inset-0 hidden bg-linear-to-r from-bg from-40% via-bg/70 via-55% to-transparent to-75% lg:block" />}
      </div>
    </div>
  )
}
