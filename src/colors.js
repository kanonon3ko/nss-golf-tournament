export const gradientBgBase = 'bg-linear-to-tr'
export const gradientBgPurplePink = `${gradientBgBase} from-purple-400 via-pink-500 to-red-500`
export const gradientBgDark = `${gradientBgBase} from-slate-700 via-slate-900 to-slate-800`
export const gradientBgPinkRed = `${gradientBgBase} from-pink-400 via-red-500 to-yellow-500`

export const colorsBgLight = {
  white: 'bg-white text-black',
  light: 'bg-white text-black dark:bg-slate-900/70 dark:text-white',
  contrast: 'bg-gray-800 text-white dark:bg-white dark:text-black',
  success: 'bg-emerald-500 border-emerald-500 text-white',
  danger: 'bg-[#a96a76] border-[#a96a76] text-white',
  warning: 'bg-[#b08a4a] border-[#b08a4a] text-white',
  info: 'bg-blue-500 border-blue-500 text-white',
  purple: 'bg-[#7e57c2] border-[#7e57c2] text-white',
}

export const colorsText = {
  white: 'text-black dark:text-slate-100',
  light: 'text-gray-700 dark:text-slate-400',
  contrast: 'dark:text-white',
  success: 'text-emerald-500',
  danger: 'text-[#a96a76]',
  warning: 'text-[#b08a4a]',
  info: 'text-blue-500',
  purple: 'text-[#7e57c2]',
}

export const colorsOutline = {
  white: [colorsText.white, 'border-gray-100'],
  light: [colorsText.light, 'border-gray-100'],
  contrast: [colorsText.contrast, 'border-gray-900 dark:border-slate-100'],
  success: [colorsText.success, 'border-emerald-500'],
  danger: [colorsText.danger, 'border-[#a96a76]'],
  warning: [colorsText.warning, 'border-[#b08a4a]'],
  info: [colorsText.info, 'border-blue-500'],
  purple: [colorsText.purple, 'border-[#7e57c2]'],
}

export const getButtonColor = (color, isOutlined, hasHover, isActive = false) => {
  const colors = {
    ring: {
      white: 'ring-gray-200 dark:ring-gray-500',
      whiteDark: 'ring-gray-200 dark:ring-gray-500',
      lightDark: 'ring-gray-200 dark:ring-gray-500',
      contrast: 'ring-gray-300 dark:ring-gray-400',
      success: 'ring-emerald-300 dark:ring-emerald-700',
      danger: 'ring-[#d4a3ac] dark:ring-[#764651]',
      warning: 'ring-[#dcc38a] dark:ring-[#7f6533]',
      info: 'ring-blue-300 dark:ring-blue-700',
      purple: 'ring-[#b39ddb] dark:ring-[#5f3ca0]',
    },
    active: {
      white: 'bg-gray-100',
      whiteDark: 'bg-gray-100 dark:bg-slate-800',
      lightDark: 'bg-gray-200 dark:bg-slate-700',
      contrast: 'bg-gray-700 dark:bg-slate-100',
      success: 'bg-emerald-700 dark:bg-emerald-600',
      danger: 'bg-[#764651]',
      warning: 'bg-[#7f6533]',
      info: 'bg-blue-700 dark:bg-blue-600',
      purple: 'bg-[#5f3ca0]',
    },
    bg: {
      white: 'bg-white text-black',
      whiteDark: 'bg-white text-black dark:bg-slate-900 dark:text-white',
      lightDark: 'bg-gray-100 text-black dark:bg-slate-800 dark:text-white',
      contrast: 'bg-gray-800 text-white dark:bg-white dark:text-black',
      success: 'bg-emerald-600 dark:bg-emerald-500 text-white',
      danger: 'bg-[#a96a76] text-white',
      warning: 'bg-[#b08a4a] text-white',
      info: 'bg-blue-600 dark:bg-blue-500 text-white',
      purple: 'bg-[#7e57c2] text-white',
    },
    bgHover: {
      white: 'hover:bg-gray-100',
      whiteDark: 'hover:bg-gray-100 dark:hover:bg-slate-800',
      lightDark: 'hover:bg-gray-200 dark:hover:bg-slate-700',
      contrast: 'hover:bg-gray-700 dark:hover:bg-slate-100',
      success:
        'hover:bg-emerald-700 hover:border-emerald-700 dark:hover:bg-emerald-600 dark:hover:border-emerald-600',
      danger:
        'hover:bg-[#8e5660] hover:border-[#8e5660]',
      warning:
        'hover:bg-[#96753c] hover:border-[#96753c]',
      info: 'hover:bg-blue-700 hover:border-blue-700 dark:hover:bg-blue-600 dark:hover:border-blue-600',
      purple: 'hover:bg-[#6d46ac] hover:border-[#6d46ac]',
    },
    borders: {
      white: 'border-white',
      whiteDark: 'border-white dark:border-slate-900',
      lightDark: 'border-gray-100 dark:border-slate-800',
      contrast: 'border-gray-800 dark:border-white',
      success: 'border-emerald-600 dark:border-emerald-500',
      danger: 'border-[#a96a76]',
      warning: 'border-[#b08a4a]',
      info: 'border-blue-600 dark:border-blue-500',
      purple: 'border-[#7e57c2]',
    },
    text: {
      contrast: 'dark:text-slate-100',
      success: 'text-emerald-600 dark:text-emerald-500',
      danger: 'text-[#a96a76] dark:text-[#c68a96]',
      warning: 'text-[#b08a4a] dark:text-[#d0ac68]',
      info: 'text-blue-600 dark:text-blue-500',
      purple: 'text-[#7e57c2] dark:text-[#a78bdc]',
    },
    outlineHover: {
      contrast:
        'hover:bg-gray-800 hover:text-gray-100 dark:hover:bg-slate-100 dark:hover:text-black',
      success:
        'hover:bg-emerald-600 hover:text-white hover:text-white dark:hover:text-white dark:hover:border-emerald-600',
      danger:
        'hover:bg-[#a96a76] hover:text-white dark:hover:text-white dark:hover:border-[#a96a76]',
      warning:
        'hover:bg-[#b08a4a] hover:text-white dark:hover:text-white dark:hover:border-[#b08a4a]',
      info: 'hover:bg-blue-600 hover:text-white dark:hover:text-white dark:hover:border-blue-600',
      purple: 'hover:bg-[#7e57c2] hover:text-white dark:hover:text-white dark:hover:border-[#7e57c2]',
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
