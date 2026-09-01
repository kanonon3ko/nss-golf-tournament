export const gradientBgBase = 'bg-linear-to-tr'
export const gradientBgPurplePink = `${gradientBgBase} from-purple-400 via-pink-500 to-red-500`
export const gradientBgDark = `${gradientBgBase} from-slate-700 via-slate-900 to-slate-800`
export const gradientBgPinkRed = `${gradientBgBase} from-pink-400 via-red-500 to-yellow-500`

export const colorsBgLight = {
  white: 'bg-white text-black',
  light: 'bg-white text-black dark:bg-slate-900/70 dark:text-white',
  contrast: 'bg-black text-white dark:bg-white dark:text-black',
  success: 'bg-[#1aae39] border-[#1aae39] text-white dark:bg-emerald-500 dark:border-emerald-500',
  danger: 'bg-[#e03131] border-[#e03131] text-white dark:bg-[#a96a76] dark:border-[#a96a76]',
  warning: 'bg-[#dd5b00] border-[#dd5b00] text-white dark:bg-[#b08a4a] dark:border-[#b08a4a]',
  info: 'bg-[#0075de] border-[#0075de] text-white dark:bg-blue-500 dark:border-blue-500',
  purple: 'bg-[#5645d4] border-[#5645d4] text-white dark:bg-[#7e57c2] dark:border-[#7e57c2]',
  gold: 'bg-[#d9b45c] border-transparent text-white dark:bg-[#c9a24b] dark:border-transparent dark:text-white',
}

export const colorsText = {
  white: 'text-black dark:text-slate-100',
  light: 'text-gray-700 dark:text-slate-400',
  contrast: 'dark:text-white',
  success: 'text-[#1aae39] dark:text-emerald-500',
  danger: 'text-[#e03131] dark:text-[#a96a76]',
  warning: 'text-[#dd5b00] dark:text-[#b08a4a]',
  info: 'text-[#0075de] dark:text-blue-500',
  purple: 'text-[#5645d4] dark:text-[#7e57c2]',
  gold: 'text-[#8c6d1f] dark:text-[#e3c565]',
}

export const colorsOutline = {
  white: [colorsText.white, 'border-gray-100'],
  light: [colorsText.light, 'border-gray-100'],
  contrast: [colorsText.contrast, 'border-gray-900 dark:border-slate-100'],
  success: [colorsText.success, 'border-[#1aae39]'],
  danger: [colorsText.danger, 'border-[#e03131]'],
  warning: [colorsText.warning, 'border-[#dd5b00]'],
  info: [colorsText.info, 'border-[#0075de]'],
  purple: [colorsText.purple, 'border-[#5645d4]'],
  gold: [colorsText.gold, 'border-transparent'],
}

export const getButtonColor = (color, isOutlined, hasHover, isActive = false) => {
  const colors = {
    ring: {
      white: 'ring-gray-200 dark:ring-gray-500',
      whiteDark: 'ring-gray-200 dark:ring-gray-500',
      lightDark: 'ring-gray-200 dark:ring-gray-500',
      contrast: 'ring-gray-300 dark:ring-gray-400',
      success: 'ring-[#79d98f] dark:ring-emerald-700',
      danger: 'ring-[#f2a5a5] dark:ring-[#764651]',
      warning: 'ring-[#f2b877] dark:ring-[#7f6533]',
      info: 'ring-[#7cc0ff] dark:ring-blue-700',
      purple: 'ring-[#a89ef0] dark:ring-[#5f3ca0]',
      gold: 'ring-[#e6c877] dark:ring-[#7f6533]',
    },
    active: {
      white: 'bg-gray-100',
      whiteDark: 'bg-gray-100 dark:bg-[#524b7a]',
      lightDark: 'bg-gray-200 dark:bg-slate-700',
      contrast: 'bg-gray-700 dark:bg-slate-100',
      success: 'bg-[#12902d] dark:bg-emerald-600',
      danger: 'bg-[#b52323] dark:bg-[#764651]',
      warning: 'bg-[#a84600] dark:bg-[#7f6533]',
      info: 'bg-[#005bab] dark:bg-blue-600',
      purple: 'bg-[#4534b3] dark:bg-[#5f3ca0]',
      gold: 'brightness-90',
    },
    bg: {
      white: 'bg-white text-black',
      whiteDark: 'bg-white text-black dark:bg-[#45406b] dark:text-[#e0e2f0]',
      lightDark: 'bg-gray-100 text-black dark:bg-slate-800 dark:text-white',
      contrast: 'bg-black text-white dark:bg-white dark:text-black',
      success: 'bg-[#1aae39] dark:bg-emerald-500 text-white',
      danger: 'bg-[#e03131] text-white dark:bg-[#a96a76]',
      warning: 'bg-[#dd5b00] text-white dark:bg-[#b08a4a]',
      info: 'bg-[#0075de] dark:bg-blue-500 text-white',
      purple: 'bg-[#5645d4] text-white dark:bg-[#7e57c2]',
      gold: 'bg-[#d9b45c] text-white dark:bg-[#c9a24b] dark:text-white',
    },
    bgHover: {
      white: 'hover:bg-gray-100',
      whiteDark: 'hover:bg-gray-100 dark:hover:bg-[#524b7a]',
      lightDark: 'hover:bg-gray-200 dark:hover:bg-slate-700',
      contrast: 'hover:bg-gray-700 dark:hover:bg-slate-100',
      success:
        'hover:bg-[#12902d] hover:border-[#12902d] dark:hover:bg-emerald-600 dark:hover:border-emerald-600',
      danger:
        'hover:bg-[#b52323] hover:border-[#b52323] dark:hover:bg-[#8e5660] dark:hover:border-[#8e5660]',
      warning:
        'hover:bg-[#a84600] hover:border-[#a84600] dark:hover:bg-[#96753c] dark:hover:border-[#96753c]',
      info: 'hover:bg-[#005bab] hover:border-[#005bab] dark:hover:bg-blue-600 dark:hover:border-blue-600',
      purple: 'hover:bg-[#4534b3] hover:border-[#4534b3] dark:hover:bg-[#6d46ac] dark:hover:border-[#6d46ac]',
      gold: 'hover:brightness-95 dark:hover:brightness-95',
    },
    borders: {
      white: 'border-[#c8c4be]',
      whiteDark: 'border-[#c8c4be] dark:border-[#675d8e]',
      lightDark: 'border-[#c8c4be] dark:border-[#58507f]',
      contrast: 'border-black dark:border-white',
      success: 'border-[#1aae39] dark:border-emerald-500',
      danger: 'border-[#e03131] dark:border-[#a96a76]',
      warning: 'border-[#dd5b00] dark:border-[#b08a4a]',
      info: 'border-[#0075de] dark:border-blue-500',
      purple: 'border-[#5645d4] dark:border-[#7e57c2]',
      gold: 'border-transparent dark:border-transparent',
    },
    text: {
      contrast: 'dark:text-slate-100',
      success: 'text-[#1aae39] dark:text-emerald-500',
      danger: 'text-[#e03131] dark:text-[#c68a96]',
      warning: 'text-[#dd5b00] dark:text-[#d0ac68]',
      info: 'text-[#0075de] dark:text-blue-500',
      purple: 'text-[#5645d4] dark:text-[#a78bdc]',
      gold: 'text-[#8c6d1f] dark:text-[#e3c565]',
    },
    outlineHover: {
      contrast:
        'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
      success:
        'hover:bg-[#1aae39] hover:text-white dark:hover:text-white dark:hover:border-emerald-500',
      danger:
        'hover:bg-[#e03131] hover:text-white dark:hover:text-white dark:hover:border-[#a96a76]',
      warning:
        'hover:bg-[#dd5b00] hover:text-white dark:hover:text-white dark:hover:border-[#b08a4a]',
      info: 'hover:bg-[#0075de] hover:text-white dark:hover:text-white dark:hover:border-blue-500',
      purple: 'hover:bg-[#5645d4] hover:text-white dark:hover:text-white dark:hover:border-[#7e57c2]',
      gold: 'hover:bg-[#cfa44a] hover:text-white dark:hover:text-white dark:hover:bg-[#b89335] dark:hover:border-transparent',
    },
  }

  if (!colors.bg[color]) {
    return color
  }

  const isOutlinedProcessed = isOutlined && ['white', 'whiteDark', 'lightDark'].indexOf(color) < 0

  const base = [colors.borders[color], colors.ring[color]]

  if (isActive) {
    base.push(colors.active[color])
  } else {
    base.push(isOutlinedProcessed ? colors.text[color] : colors.bg[color])
  }

  if (hasHover) {
    base.push(isOutlinedProcessed ? colors.outlineHover[color] : colors.bgHover[color])
  }

  return base
}
